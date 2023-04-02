import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType, type WorkerMessageWithSender, type WorkerState, WorkerStatus } from '@proton/pass/types';
import { isMainFrame } from '@proton/pass/utils/dom';
import { safeCall } from '@proton/pass/utils/fp';
import { createListenerStore } from '@proton/pass/utils/listener';
import { logger } from '@proton/pass/utils/logger';
import sentry, { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import debounce from '@proton/utils/debounce';
import noop from '@proton/utils/noop';

import * as config from '../../app/config';
import { ExtensionContext, type ExtensionContextType, setupExtensionContext } from '../../shared/extension';
import { CONTENT_SCRIPT_INJECTED_MESSAGE } from '../constants';
import CSContext, { ContentScriptContext } from '../context';
import { getAllFields } from '../handles/form';
import { DOMCleanUp } from '../injections/cleanup';
import { isIFrameRootAttached } from '../injections/iframe/create-iframe-root';
import { createFormManager } from './form/manager';
import { createDropdown } from './iframes/dropdown';
import { createNotification } from './iframes/notification';

export const createContentScriptService = (id: string) => {
    logger.info(`[ContentScript::${id}] Registering content-script`);

    const listeners = createListenerStore();
    const createIFrames = () => ({
        dropdown: createDropdown(),
        notification: isMainFrame() ? createNotification() : null,
    });

    const context: ContentScriptContext = CSContext.set({
        id,
        active: true,
        formManager: createFormManager(),
        iframes: createIFrames(),
        state: {
            loggedIn: false,
            status: WorkerStatus.IDLE,
            UID: undefined,
        },
    });

    sentry({
        config,
        sentryConfig: {
            host: new URL(config.API_URL).host,
            release: config.APP_VERSION,
            environment: `browser-pass::content-script`,
        },
        ignore: () => false,
    });

    const destroy = (options: { dom?: boolean; reason: string }) => {
        logger.info(`[ContentScript::${id}] destroying.. [reason: "${options.reason}"]`);

        listeners.removeAll();

        context.formManager.sleep();
        context.iframes.dropdown.close();
        context.iframes.notification?.close();
        context.active = false;

        /* may fail if context already invalidated */
        safeCall(ExtensionContext.get().port.disconnect);

        if (options.dom) {
            DOMCleanUp();
        }
    };

    const onWorkerStateChange = (workerState: WorkerState) => {
        const { loggedIn, UID } = workerState;
        setSentryUID(UID);

        context.state = workerState;
        context.iframes.dropdown.reset(workerState);

        context.formManager.getForms().forEach((form) => {
            const fields = getAllFields(form);
            fields.forEach((field) => {
                field.icon?.setStatus(workerState.status);
                return !loggedIn && field?.icon?.setCount(0);
            });
        });

        if (!loggedIn) {
            context.formManager.autofill.setLoginItemsCount(0);
            context.iframes.notification?.reset?.(workerState);
        }
    };

    const onPortMessage = async (message: WorkerMessageWithSender): Promise<void> => {
        if (message.sender === 'background') {
            switch (message.type) {
                case WorkerMessageType.UNLOAD_CONTENT_SCRIPT:
                    return destroy({ dom: true, reason: 'unload script' });
                case WorkerMessageType.WORKER_STATUS:
                    return onWorkerStateChange(message.payload.state);
                case WorkerMessageType.AUTOFILL_SYNC: {
                    return context.formManager.autofill.setLoginItemsCount(message.payload.count);
                }
            }
        }
    };

    const ensureIFramesAttached = () => {
        if (!isIFrameRootAttached()) {
            context.iframes = createIFrames();
        }
    };

    const handleStart = async ({ tabId, port }: ExtensionContextType) => {
        try {
            const res = await sendMessage(
                contentScriptMessage({
                    type: WorkerMessageType.WORKER_WAKEUP,
                    payload: { endpoint: 'content-script', tabId },
                })
            );

            context.iframes.dropdown.init(port);
            context.iframes.notification?.init(port);

            if (res.type === 'success') {
                const workerState = { loggedIn: res.loggedIn, status: res.status, UID: res.UID };
                logger.info(`[ContentScript::${id}] Worker status resolved "${workerState.status}"`);

                onWorkerStateChange(workerState);
                context.formManager.observe();
                context.formManager.detect('VisibilityChange');

                port.onMessage.addListener(onPortMessage);
                listeners.addObserver(debounce(ensureIFramesAttached, 500), document.body, { childList: true });

                context.active = true;
            }
        } catch (_) {
            context.active = false;
        }
    };

    const setup = async () => {
        try {
            return await setupExtensionContext({
                endpoint: 'content-script',
                onDisconnect: () => destroy({ dom: false, reason: 'port disconnected' }),
                onContextChange: (nextCtx) => handleStart(nextCtx).catch(noop),
            });
        } catch (e) {
            logger.warn(`[ContentScript::${id}] Setup error`, e);
        }
    };

    const handleVisibilityChange = async () => {
        try {
            switch (document.visibilityState) {
                case 'visible': {
                    const extensionContext = await setup();
                    return extensionContext && (await handleStart(extensionContext));
                }
                case 'hidden': {
                    return destroy({ dom: false, reason: 'visibility change' });
                }
            }
        } catch (e) {
            logger.warn(`[ContentScript::${id}] invalidation error`, e);
            /**
             * Reaching this catch block will likely happen
             * when the setup function fails due to an extension
             * update. At this point we should remove any listeners
             * in this now-stale content-script and delete any
             * allocated resources
             */
            context.active = false;
            destroy({ dom: true, reason: 'context invalidated' });
        }
    };

    /**
     * If another content-script is being injected - if
     * the extension updates - we should destroy the current
     * one and let the incoming one take over.
     */
    const handlePostMessage = (message: MessageEvent) => {
        if (message.data?.type === CONTENT_SCRIPT_INJECTED_MESSAGE && message?.data?.id !== id) {
            logger.info(`[ContentScript::${id}] a newer content-script::${message.data.id} was detected !`);
            context.active = false;
            context.iframes.dropdown.destroy();
            context.iframes.notification?.destroy();

            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('message', handlePostMessage);

            destroy({ dom: true, reason: 'incoming injection' });
        }
    };

    window.addEventListener('message', handlePostMessage);

    return {
        watch: (mainFrame: boolean) => {
            setup()
                .then((extensionContext) => {
                    /**
                     * When browser recovers a browsing session (ie: upon
                     * restarting after an exit) content-scripts will be
                     * re-injected in all the recovered tabs. As such, we
                     * want to only "start" the content-script if the tab
                     * is visible to avoid swarming the worker with wake-ups.
                     */
                    if (document.visibilityState === 'visible' && extensionContext && context.active) {
                        return handleStart(extensionContext);
                    }
                })
                .then(() => {
                    /**
                     * We only want to track visibility change on the
                     * root main frame to avoid unnecessary detections
                     */
                    if (mainFrame) {
                        window.addEventListener('visibilitychange', handleVisibilityChange);
                    }
                })
                .catch(noop);
        },
    };
};
