import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import devToolsEnhancer from 'remote-redux-devtools';

import { backgroundMessage } from '@proton/pass/extension/message';
import { browserLocalStorage, browserSessionStorage } from '@proton/pass/extension/storage';
import reducer from '@proton/pass/store/reducers';
import { workerRootSaga } from '@proton/pass/store/sagas';
import { ShareEventType, WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';

import { ENV } from '../../shared/extension';
import WorkerMessageBroker from '../channel';
import { withContext } from '../context/helpers';
import { workerMiddleware } from './worker.middleware';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer,
    middleware: [workerMiddleware, sagaMiddleware],
    enhancers:
        ENV === 'development'
            ? [
                  devToolsEnhancer({
                      name: 'background',
                      port: 8000,
                      realtime: true,
                      secure: true,
                  }),
              ]
            : [],
});

sagaMiddleware.run(
    workerRootSaga.bind(null, {
        /**
         * Sets the worker status according to the
         * boot sequence's result. On boot failure,
         * clear
         */
        onBoot: withContext(async (ctx, result) => {
            if (result.ok) {
                ctx.setStatus(WorkerStatus.READY);
                WorkerMessageBroker.buffer.flush();
            } else {
                ctx.setStatus(WorkerStatus.ERROR);
                await Promise.all([browserLocalStorage.clear(), browserSessionStorage.clear()]);
            }
        }),

        onSignout: withContext(async (ctx) => {
            await Promise.all([browserLocalStorage.clear(), browserSessionStorage.clear()]);
            ctx.service.auth.logout();
        }),

        onSessionUnlocked: withContext(async (ctx) => {
            ctx.service.auth.unlock();
            await ctx.init({ force: true });
        }),

        /**
         * Update the extension's badge count on every
         * item state change
         */
        onItemsChange: withContext((ctx) => ctx.service.autofill.updateTabsBadgeCount()),

        onShareEventDisabled: (shareId) => {
            WorkerMessageBroker.ports.broadcast(
                backgroundMessage({
                    type: WorkerMessageType.SHARE_SERVER_EVENT,
                    payload: {
                        type: ShareEventType.SHARE_DISABLED,
                        shareId,
                    },
                }),
                (name) => name.startsWith('popup')
            );
        },

        onShareEventItemsDeleted: (shareId, itemIds) => {
            WorkerMessageBroker.ports.broadcast(
                backgroundMessage({
                    type: WorkerMessageType.SHARE_SERVER_EVENT,
                    payload: {
                        type: ShareEventType.ITEMS_DELETED,
                        shareId,
                        itemIds,
                    },
                }),
                (name) => name.startsWith('popup')
            );
        },

        /**
         * Either broadcast notification or buffer it
         * if no target ports are opened. Assume that if no
         * target is specified then notification is for popup
         */
        onNotification: (notification) => {
            const { target } = notification;
            const ports = WorkerMessageBroker.ports.query((key) => key.startsWith(target ?? 'popup'));
            const canConsume = ports.length > 0;

            const message = backgroundMessage({
                type: WorkerMessageType.NOTIFICATION,
                payload: { notification },
            });

            logger.info(`[Notification::${notification.type}] ${notification.text} - broadcasting`);

            return canConsume || notification.type === 'success'
                ? WorkerMessageBroker.ports.broadcast(message)
                : WorkerMessageBroker.buffer.push(message);
        },
    })
);

export default store;
