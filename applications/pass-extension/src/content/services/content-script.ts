import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType, WorkerMessageWithSender, WorkerState, WorkerStatus } from '@proton/pass/types';
import { isMainFrame } from '@proton/pass/utils/dom';
import { createListenerStore } from '@proton/pass/utils/listener';
import { logger } from '@proton/pass/utils/logger';
import sentry, { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import debounce from '@proton/utils/debounce';
import noop from '@proton/utils/noop';

import * as config from '../../app/config';
import { ExtensionContext, ExtensionContextType, setupExtensionContext } from '../../shared/extension';
import { CONTENT_SCRIPT_INJECTED } from '../constants';
import CSContext, { ContentScriptContext } from '../context';
import { getAllFields } from '../handles/form';
import { isIFrameRootAttached } from '../injections/iframe/create-iframe-root';
import { createFormManager } from './form/manager';
import { createDropdown } from './iframes/dropdown';
import { createNotification } from './iframes/notification';

export const createContentScriptService = () => {
    const listeners = createListenerStore();

    const createIFrames = () => ({
        dropdown: createDropdown(),
        notification: isMainFrame() ? createNotification() : null,
    });

    const context: ContentScriptContext = CSContext.set({
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

            if (res.type === 'success') {
                const workerState = { loggedIn: res.loggedIn, status: res.status, UID: res.UID };
                onWorkerStateChange(workerState);

                logger.info(`[ContentScript::Start] Worker "${workerState.status}"`);

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

    const destroy = () => {
        const extensionContext = ExtensionContext.get();

        context.formManager.sleep();
        context.iframes.dropdown.close();
        context.iframes.notification?.close();
        context.active = false;

        try {
            /* may fail if context already invalidated */
            extensionContext.port.disconnect();
        } catch (_) {}

        listeners.removeAll();
    };

    const setup = async () => {
        try {
            return await setupExtensionContext({
                endpoint: 'content-script',
                onDisconnect: () => destroy(),
                onContextChange: (nextCtx) => handleStart(nextCtx).catch(noop),
            });
        } catch (e) {
            logger.warn('[ContentScript::SetupError]', e);
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
                    return destroy();
                }
            }
        } catch (e) {
            logger.warn(`[ContentScript::InvalidationError]`, e);
            /**
             * Reaching this catch block will likely happen
             * when the setup function fails due to an extension
             * update. At this point we should remove any listeners
             * in this now-stale content-script and delete any
             * allocated resources
             */
            context.active = false;
            destroy();
        }
    };

    /**
     * If another content-script is being injected - if
     * the extension updates - we should destroy the current
     * one and let the incoming one take over.
     */
    window.addEventListener('message', (message) => {
        if (message.data === CONTENT_SCRIPT_INJECTED) {
            logger.info(`[ContentScript::Invalidated] a newer content-script was injected`);
            context.active = false;
            context.iframes.dropdown.destroy();
            context.iframes.notification?.destroy();

            window.removeEventListener('visibilitychange', handleVisibilityChange);
            destroy();
        }
    });

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
