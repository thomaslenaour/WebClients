import { Middleware } from 'redux';

import { MessageWithSenderFactory, sendMessage } from '@proton/pass/extension/message';
import { isSynchronous } from '@proton/pass/store/actions/creators/utils';
import { WorkerMessageType, WorkerMessageWithSender } from '@proton/pass/types';
import noop from '@proton/utils/noop';

import { ExtensionContext } from '../extension';

/*
 * This middleware eats all actions coming through on purpose and sends them
 * to the worker for re-emission. This is to guarantee the same order of event
 * occurrence throughout worker, popup and content.
 *
 * It also listens for actions being emitted by the worker to re-integrate into
 * its local pipeline.
 */
export const proxyActionsMiddleware =
    (messageFactory: MessageWithSenderFactory): Middleware =>
    () =>
    (next) => {
        ExtensionContext.get().port.onMessage.addListener((message: WorkerMessageWithSender) => {
            if (message.sender === 'background' && message.type === WorkerMessageType.STORE_ACTION) {
                if (!isSynchronous(message.payload.action)) {
                    next(message.payload.action);
                }
            }
        });

        return (action) => {
            if (isSynchronous(action)) {
                next(action);
            }

            sendMessage(messageFactory({ type: WorkerMessageType.STORE_ACTION, payload: { action } })).catch(noop);
        };
    };
