import { WorkerState, WorkerStatus } from '@proton/pass/types';
import { createSharedContext } from '@proton/pass/utils/context';
import { waitUntil } from '@proton/pass/utils/fp';
import { invert } from '@proton/pass/utils/fp/predicates';
import { workerBusy } from '@proton/pass/utils/worker';

import { AliasService } from './services/alias';
import { AuthService } from './services/auth';
import { AutoFillService } from './services/autofill';
import { AutoSaveService } from './services/autosave';

export type WorkerInitOptions = {
    sync?: boolean /* will clear local storage */;
    force?: boolean /* will bypass busy state */;
};

export type ServiceWorkerContext = {
    status: WorkerStatus;
    alias: AliasService;
    auth: AuthService;
    autosave: AutoSaveService;
    autofill: AutoFillService;
    setStatus: (status: WorkerStatus) => void;
    getState: () => WorkerState;
    boot: () => void;
    init: (options: WorkerInitOptions) => Promise<WorkerState>;
};

const WorkerContext = createSharedContext<ServiceWorkerContext>('worker');

export const waitForContext = async (): Promise<ServiceWorkerContext> => {
    const context = WorkerContext.get();
    await waitUntil(() => invert(workerBusy)(context.getState().status), 50);

    return context;
};

export default WorkerContext;
