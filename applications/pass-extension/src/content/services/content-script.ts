import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType, WorkerMessageWithSender, WorkerState, WorkerStatus } from '@proton/pass/types';
import { isMainFrame } from '@proton/pass/utils/dom';
import { createListenerStore } from '@proton/pass/utils/listener';
import { logger } from '@proton/pass/utils/logger';
import sentry, { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import debounce from '@proton/utils/debounce';
import noop from '@proton/utils/noop';

import * as config from '../../app/config';
import { ENV, ExtensionContext, ExtensionContextType, setupExtensionContext } from '../../shared/extension';
import CSContext, { ContentScriptContext } from '../context';
import { getAllFields } from '../handles/form';
import { isIFrameRootAttached } from '../injections/iframe/create-iframe-root';
import { createFormManager } from './form/manager';
import { createDropdown } from './iframes/dropdown';
import { createNotification } from './iframes/notification';

export const createContentScriptService = () => {
    const createIFrames = () => ({
        dropdown: createDropdown(),
        notification: isMainFrame() ? createNotification() : null,
    });

    const context: ContentScriptContext = CSContext.set({
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

    const listeners = createListenerStore();

    const onWorkerStateChange = (workerState: WorkerState) => {
        const { loggedIn, UID } = workerState;
        setSentryUID(UID);

        context.state = workerState;
        context.iframes.dropdown.reset(workerState);

        context.formManager.getForms().forEach((form) => {
            const fields = getAllFields(form);
            fields.forEach((field) => {
                field.icon?.setActive(loggedIn);
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
                case WorkerMessageType.DEV_SERVER: {
                    if (ENV === 'development' && isMainFrame()) {
                        return window.location.reload();
                    }
                    break;
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

            const workerState =
                res.type === 'success'
                    ? { loggedIn: res.loggedIn, status: res.status, UID: res.UID }
                    : { loggedIn: false, status: WorkerStatus.ERROR, UID: undefined };

            context.formManager.observe();
            context.formManager.detect('VisibilityChange');

            onWorkerStateChange(workerState);
            port.onMessage.addListener(onPortMessage);

            listeners.addObserver(debounce(ensureIFramesAttached, 500), document.body, { childList: true });
        } catch (_) {}
    };

    const setup = async () => {
        try {
            return await setupExtensionContext({
                endpoint: 'content-script',
                onDisconnect: (prevContext) => prevContext.port.onMessage.removeListener(onPortMessage),
                onContextChange: (nextContext) => {
                    context.formManager.sleep();
                    handleStart(nextContext).catch(noop);
                },
            });
        } catch (e) {
            logger.warn('[ContentScript::Setup]', e);
        }
    };

    return {
        watch: (mainFrame: boolean) => {
            setup()
                .then((context) => {
                    /**
                     * When browser recovers a browsing session (ie: upon
                     * restarting after an exit) content-scripts will be
                     * re-injected in all the recovered tabs. As such, we
                     * want to only "start" the content-script if the tab
                     * is visible to avoid swarming the worker with wake-ups.
                     */
                    if (document.visibilityState === 'visible' && context) {
                        return handleStart(context);
                    }
                })
                .then(() => {
                    /**
                     * We only want to track visibility change on the
                     * root main frame to avoid unnecessary detections
                     */
                    if (mainFrame) {
                        window.addEventListener('visibilitychange', async () => {
                            try {
                                switch (document.visibilityState) {
                                    case 'visible': {
                                        const context = await setup();
                                        return context && (await handleStart(context));
                                    }
                                    case 'hidden': {
                                        context.formManager.sleep();
                                        context.iframes.dropdown.close();
                                        ExtensionContext.get().port.disconnect();
                                        listeners.removeAll();
                                        return;
                                    }
                                }
                            } catch (_) {}
                        });
                    }
                })
                .catch(noop);
        },
    };
};
