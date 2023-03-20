import { WorkerState } from '@proton/pass/types';
import { createSharedContext } from '@proton/pass/utils/context';

import { FormManager } from './services/form/manager';
import { InjectedDropdown, InjectedNotification } from './types';

export type WorkerStateChangeHandler = (state: WorkerState) => void;
export interface ContentScriptContext {
    state: WorkerState;
    iframes: { dropdown: InjectedDropdown; notification: InjectedNotification | null };
    formManager: FormManager;
}

const CSContext = createSharedContext<ContentScriptContext>('content-script');

export default CSContext;
