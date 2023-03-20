import { WorkerMessageType } from '@proton/pass/types';

import WorkerMessageBroker from '../channel';
import { waitForContext } from '../context';
import store from '../store';

export const createStoreService = () => {
    WorkerMessageBroker.registerMessage(WorkerMessageType.STORE_ACTION, async (message) => {
        await waitForContext();
        store.dispatch(message.payload.action);

        return true;
    });

    return {};
};

export type StoreService = ReturnType<typeof createStoreService>;
