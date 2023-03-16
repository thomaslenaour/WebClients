import { put, takeLeading } from 'redux-saga/effects';

import { lockSession } from '@proton/pass/auth/session-lock';

import { sessionLockEnableFailure, sessionLockEnableIntent, sessionLockEnableSuccess } from '../actions';
import { WorkerRootSagaOptions } from '../types';

function* enableSessionLockWorker(
    { onSessionLocked }: WorkerRootSagaOptions,
    action: ReturnType<typeof sessionLockEnableIntent>
) {
    try {
        const storageToken: string = yield lockSession(action.payload.pin, action.payload.ttl);
        yield put(sessionLockEnableSuccess({ storageToken }));
        onSessionLocked?.(storageToken);
    } catch (e) {
        yield put(sessionLockEnableFailure(e));
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(sessionLockEnableIntent.match, enableSessionLockWorker, options);
}
