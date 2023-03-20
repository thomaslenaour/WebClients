import { WorkerState, WorkerStatus } from '@proton/pass/types';

export type ExtensionAppContextValue = {
    state: WorkerState;
    ready: boolean;
    logout: (options: { soft: boolean }) => void;
};

export const INITIAL_WORKER_STATE: WorkerState = {
    loggedIn: false,
    status: WorkerStatus.IDLE,
    UID: undefined,
};
