import { put, takeLeading } from 'redux-saga/effects';

import { deleteSessionLock } from '@proton/pass/auth/session-lock';

import { sessionLockDisableFailure, sessionLockDisableIntent, sessionLockDisableSuccess } from '../actions';
import { WorkerRootSagaOptions } from '../types';

function* disableSessionLockWorker(
    { onSessionUnlocked }: WorkerRootSagaOptions,
    action: ReturnType<typeof sessionLockDisableIntent>
) {
    try {
        const storageToken: string = yield deleteSessionLock(action.payload.pin);
        yield put(sessionLockDisableSuccess());
        onSessionUnlocked?.(storageToken);
    } catch (e) {
        yield put(sessionLockDisableFailure(e));
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(sessionLockDisableIntent.match, disableSessionLockWorker, options);
}
