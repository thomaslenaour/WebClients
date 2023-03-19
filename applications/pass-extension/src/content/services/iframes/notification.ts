import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { AutoSaveRequestMessage, WorkerMessageType, WorkerResponse } from '@proton/pass/types';
import { waitUntil } from '@proton/pass/utils/fp';

import { EXTENSION_PREFIX, NOTIFICATION_HEIGHT, NOTIFICATION_IFRAME_SRC, NOTIFICATION_WIDTH } from '../../constants';
import { createIFrameApp } from '../../injections/iframe/create-iframe-app';
import { IFrameMessageBroker } from '../../injections/iframe/messages';
import {
    InjectedNotification,
    NotificationAction,
    NotificationIframeMessage,
    NotificationMessageType,
    OpenNotificationOptions,
} from '../../types';

export const createNotification = (): InjectedNotification => {
    const app = createIFrameApp<NotificationIframeMessage>({
        id: 'notification',
        src: NOTIFICATION_IFRAME_SRC,
        animation: 'slidein',
        backdropClose: false,
        classNames: [`${EXTENSION_PREFIX}-iframe-fixed`],
        onClose: () =>
            sendMessage(
                contentScriptMessage({ type: WorkerMessageType.STASH_FORM_SUBMISSION, reason: 'AUTOSAVE_DISMISSED' })
            ),
        getIframePosition: () => ({ top: 15, right: 15 }),
        getIframeDimensions: () => ({ width: NOTIFICATION_WIDTH, height: NOTIFICATION_HEIGHT }),
    });

    const open = async ({ action, submission }: OpenNotificationOptions) => {
        await waitUntil(() => app.state.ready, 50);

        if (action === NotificationAction.AUTOSAVE_PROMPT) {
            app.sendMessage({
                type: NotificationMessageType.SET_ACTION,
                payload: {
                    action,
                    submission,
                },
            });
            app.open();
        }
    };

    const handleAutoSaveResponse = (response: WorkerResponse<AutoSaveRequestMessage>) => {
        switch (response.type) {
            case 'success': {
                app.sendMessage({ type: NotificationMessageType.AUTOSAVE_SUCCESS });
                return sendMessage(
                    contentScriptMessage({
                        type: WorkerMessageType.STASH_FORM_SUBMISSION,
                        reason: 'AUTOSAVE_SUCCESS',
                    })
                );
            }
            case 'error': {
                return app.sendMessage({
                    type: NotificationMessageType.AUTOSAVE_FAILURE,
                    error: response.error,
                });
            }
        }
    };

    const notification: InjectedNotification = {
        getState: () => app.state,
        sendMessage: app.sendMessage,
        reset: app.reset,
        close: app.close,
        destroy: app.destroy,
        open,
    };

    IFrameMessageBroker.onInjectedFrameMessage<NotificationIframeMessage>('notification', async (message) => {
        switch (message.type) {
            case NotificationMessageType.AUTOSAVE_REQUEST: {
                return handleAutoSaveResponse(
                    await sendMessage(
                        contentScriptMessage({
                            type: WorkerMessageType.AUTOSAVE_REQUEST,
                            payload: message.payload,
                        })
                    )
                );
            }
            default:
                return;
        }
    });

    return notification;
};
