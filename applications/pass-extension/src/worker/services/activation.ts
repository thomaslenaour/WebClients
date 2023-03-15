import { boot, wakeup } from '@proton/pass/store/actions';
import type { WorkerMessageResponse, WorkerMessageWithSender, WorkerWakeUpMessage } from '@proton/pass/types';
import { WorkerMessageType } from '@proton/pass/types';

import WorkerMessageBroker from '../channel';
import WorkerContext from '../context';
import store from '../store';

export const createActivationService = () => {
    /**
     * When waking up from the pop-up (or page) we need to trigger the background wakeup
     * saga while immediately resolving the worker state so the UI can respond to state
     * changes as soon as possible. Regarding the content-script, we simply wait for a
     * ready state as its less "critical".
     */
    const handleWakeup = async (message: WorkerMessageWithSender<WorkerWakeUpMessage>) => {
        const context = WorkerContext.get();
        const { status } = await context.init({});

        return new Promise<WorkerMessageResponse<WorkerMessageType.WORKER_WAKEUP>>(async (resolve) => {
            const { sender: endpoint, payload } = message;
            const { tabId } = payload;

            switch (message.sender) {
                case 'popup':
                case 'page': {
                    /* dispatch a wakeup action for this specific receiver.
                    tracking the wakeup's request metadata can be consumed
                    in the UI to infer wakeup result - see `wakeup.saga.ts` */
                    store.dispatch(wakeup({ endpoint, tabId, status }));

                    resolve({
                        ...context.getState(),
                        buffered: WorkerMessageBroker.buffer.flush(),
                    });
                }
                case 'content-script': {
                    /* no need for any redux operations on content-script
                    wakeup as it doesn't hold any store. */
                    return resolve((await context.waitForReady()).getState());
                }
            }
        });
    };

    WorkerMessageBroker.registerMessage(WorkerMessageType.WORKER_WAKEUP, handleWakeup);

    return {
        boot: () => store.dispatch(boot({})),
    };
};

export type ActivationService = ReturnType<typeof createActivationService>;
