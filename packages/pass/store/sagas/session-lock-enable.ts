import { put, takeLeading } from 'redux-saga/effects';

import { lockSession } from '@proton/pass/auth/session-lock';

import { sessionLockEnableFailure, sessionLockEnableIntent, sessionLockEnableSuccess } from '../actions';
import { WorkerRootSagaOptions } from '../types';

function* enableSessionLockWorker(
    _: WorkerRootSagaOptions,
    { meta, payload }: ReturnType<typeof sessionLockEnableIntent>
) {
    try {
        const storageToken: string = yield lockSession(payload.pin, payload.ttl);
        yield put(sessionLockEnableSuccess({ storageToken, ttl: payload.ttl }, meta.receiver));
    } catch (e) {
        yield put(sessionLockEnableFailure(e, meta.receiver));
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(sessionLockEnableIntent.match, enableSessionLockWorker, options);
}
