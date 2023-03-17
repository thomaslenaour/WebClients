import { put, takeLeading } from 'redux-saga/effects';

import { unlockSession } from '@proton/pass/auth/session-lock';

import { sessionUnlockFailure, sessionUnlockIntent, sessionUnlockSuccess } from '../actions';
import { WorkerRootSagaOptions } from '../types';

function* unlockSessionWorker(
    { onSessionUnlocked }: WorkerRootSagaOptions,
    action: ReturnType<typeof sessionUnlockIntent>
) {
    try {
        const storageToken: string = yield unlockSession(action.payload.pin);
        yield put(sessionUnlockSuccess({ storageToken }));
        onSessionUnlocked?.(storageToken);
    } catch (e) {
        yield put(sessionUnlockFailure(e));
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(sessionUnlockIntent.match, unlockSessionWorker, options);
}
