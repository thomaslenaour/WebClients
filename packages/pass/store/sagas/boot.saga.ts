import { call, put, select, takeLeading } from 'redux-saga/effects';

import { api } from '@proton/pass/api/api';
import { authentication } from '@proton/pass/auth/authentication';
import { PassCrypto } from '@proton/pass/crypto';
import { PassCryptoHydrationError } from '@proton/pass/crypto/utils/errors';
import { Maybe } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { merge } from '@proton/pass/utils/object';
import { getAllAddresses } from '@proton/shared/lib/api/addresses';
import { getUser } from '@proton/shared/lib/api/user';
import { Address, User } from '@proton/shared/lib/interfaces';

import { boot, bootFailure, bootSuccess, stateSync } from '../actions';
import { selectAllAddresses, selectSessionLockToken, selectUser } from '../selectors';
import { State, WorkerRootSagaOptions } from '../types';
import getCachedState, { ExtensionCache } from './workers/cache';
import { SyncType, SynchronizationResult, synchronize } from './workers/sync';

function* bootWorker({ onBoot }: WorkerRootSagaOptions) {
    try {
        const sessionLockToken: Maybe<string> = yield select(selectSessionLockToken);
        const cache: Maybe<ExtensionCache> = yield getCachedState(sessionLockToken);

        const currentState: State = yield select();
        const state = merge(cache?.state ?? {}, currentState);

        logger.info(`[Saga::Boot] ${cache !== undefined ? 'Booting from cache' : 'Cache not found during boot'}`);

        const cachedUser = selectUser(state);
        const cachedAddresses = selectAllAddresses(state) ?? [];

        const [user, addresses] = (yield Promise.all([
            cachedUser ?? api<{ User: User }>(getUser()).then(({ User }) => User),
            cachedAddresses.length > 0 ? cachedAddresses : getAllAddresses(api),
        ])) as [User, Address[]];

        const keyPassword = authentication.getPassword();
        yield call(PassCrypto.hydrate, { keyPassword, user, addresses, snapshot: cache?.snapshot });

        /* hydrate the background store from cache - see `reducers/index.ts` */
        yield put(stateSync(state, { receiver: 'background' }));

        yield put(
            bootSuccess({
                user,
                addresses,
                sync: (yield synchronize(state, SyncType.PARTIAL)) as SynchronizationResult,
            })
        );

        onBoot?.({ ok: true });
    } catch (error: unknown) {
        logger.warn('[Saga::Boot]', error);
        yield put(bootFailure(error));

        onBoot?.({
            ok: false,
            clearCache: error instanceof PassCryptoHydrationError,
        });
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(boot.match, bootWorker, options);
}
