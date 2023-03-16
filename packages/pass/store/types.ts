import * as actions from './actions';
import { Notification } from './actions/with-notification';
import { rootReducer } from './reducers';

export type State = ReturnType<typeof rootReducer>;
export type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export type WorkerRootSagaOptions = {
    onBoot?: (result: { ok: boolean }) => void;
    onSignout?: () => void;
    onSessionLocked?: (storageToken: string) => void;
    onSessionUnlocked?: (storageToken: string) => void;
    onNotification?: (notification: Notification) => void;
    onItemsChange?: () => void;
    onShareEventDisabled?: (shareId: string) => void;
    onShareEventItemsDeleted?: (shareId: string, itemIds: string[]) => void;
};
