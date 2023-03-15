import { WorkerMessageType } from '@proton/pass/types';

import WorkerMessageBroker from '../channel';
import WorkerContext from '../context';
import store from '../store';

export const createStoreService = () => {
    WorkerMessageBroker.registerMessage(WorkerMessageType.STORE_ACTION, async (message) => {
        await WorkerContext.get().waitForReady();

        store.dispatch(message.payload.action);
        return true;
    });

    return {};
};

export type StoreService = ReturnType<typeof createStoreService>;
