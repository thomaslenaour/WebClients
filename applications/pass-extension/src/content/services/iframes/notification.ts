import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType } from '@proton/pass/types';
import { waitUntil } from '@proton/pass/utils/fp';

import { EXTENSION_PREFIX, NOTIFICATION_HEIGHT, NOTIFICATION_IFRAME_SRC, NOTIFICATION_WIDTH } from '../../constants';
import { createIFrameApp } from '../../injections/iframe/create-iframe-app';
import { IFrameMessageType, type InjectedNotification, type OpenNotificationOptions } from '../../types';

export const createNotification = (): InjectedNotification => {
    const iframe = createIFrameApp({
        id: 'notification',
        src: NOTIFICATION_IFRAME_SRC,
        animation: 'slidein',
        backdropClose: false,
        classNames: [`${EXTENSION_PREFIX}-iframe-fixed`],
        onClose: () =>
            sendMessage(
                contentScriptMessage({
                    type: WorkerMessageType.STASH_FORM_SUBMISSION,
                    reason: 'AUTOSAVE_DISMISSED',
                })
            ),
        getIframePosition: () => ({ top: 15, right: 15 }),
        getIframeDimensions: () => ({ width: NOTIFICATION_WIDTH, height: NOTIFICATION_HEIGHT }),
    });

    const open = async ({ action, submission }: OpenNotificationOptions) => {
        await waitUntil(() => iframe.state.ready, 50);

        iframe.sendPortMessage({ type: IFrameMessageType.NOTIFICATION_ACTION, payload: { action, submission } });
        iframe.open();
    };

    return {
        getState: () => iframe.state,
        reset: iframe.reset,
        init: iframe.init,
        close: iframe.close,
        destroy: iframe.destroy,
        open,
    };
};
