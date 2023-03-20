import { put, select, take, takeEvery } from 'redux-saga/effects';

import { authentication } from '@proton/pass/auth';
import { WorkerStatus } from '@proton/pass/types';

import * as action from '../actions';
import { boot, wakeupSuccess } from '../actions';
import { State } from '../types';

function* wakeupWorker({ payload: { status, tabId, origin } }: ReturnType<typeof action.wakeup>) {
    const loggedIn = authentication?.hasSession();

    switch (status) {
        case WorkerStatus.IDLE:
        case WorkerStatus.ERROR: {
            if (loggedIn) {
                yield put(boot({}));
                yield take(action.bootSuccess.match);
            }
            break;
        }
        case WorkerStatus.BOOTING:
        case WorkerStatus.RESUMING: {
            yield take(action.bootSuccess.match);
            break;
        }
        default: {
            break;
        }
    }

    /**
     * This action is handled at the rootReducer
     * level : the wakeupSuccess action will be
     * broadcasted to the pop-up so as to sync its
     * local store with the worker state (with the
     * extra overhead of consuming a "noop" action
     * - it acts as a "state setter" on both ends)
     */
    yield put(wakeupSuccess({ state: (yield select()) as State, tabId, origin }));
}

export default function* wakeup(): Generator {
    yield takeEvery(action.wakeup.match, wakeupWorker);
}
