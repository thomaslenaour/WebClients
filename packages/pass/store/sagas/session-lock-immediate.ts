import { select, takeLeading } from 'redux-saga/effects';

import { lockSessionImmediate } from '@proton/pass/auth/session-lock';
import type { Maybe } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';

import { sessionLockImmediate } from '../actions';
import { selectSessionLockToken } from '../selectors';
import type { WorkerRootSagaOptions } from '../types';

/**
 * If we the user has not registered a lock yet (ie: has
 * a sessionLockToken saved) then this saga should have
 * no effect.
 */
function* lockSessionImmediateWorker({ onSessionLocked }: WorkerRootSagaOptions) {
    const storageToken: Maybe<string> = yield select(selectSessionLockToken);

    if (storageToken) {
        try {
            yield lockSessionImmediate();
        } catch (e) {
            logger.info('[Saga::SessionLock] Could not lock session on back-end');
        } finally {
            onSessionLocked?.(storageToken);
        }
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(sessionLockImmediate.match, lockSessionImmediateWorker, options);
}
