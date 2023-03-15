import { call, put, select, takeLeading } from 'redux-saga/effects';

import { api } from '@proton/pass/api/api';
import { authentication } from '@proton/pass/auth/authentication';
import { PassCrypto } from '@proton/pass/crypto';
import { Maybe } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { getAllAddresses } from '@proton/shared/lib/api/addresses';
import { getUser } from '@proton/shared/lib/api/user';
import { Address, User } from '@proton/shared/lib/interfaces';

import { boot, bootFailure, bootSuccess, stateSync } from '../actions';
import { selectAllAddresses, selectUser } from '../selectors';
import { State, WorkerRootSagaOptions } from '../types';
import getCachedState, { ExtensionCache } from './workers/cache';
import { SyncType, SynchronizationResult, synchronize } from './workers/sync';

function* bootWorker({ onBoot }: WorkerRootSagaOptions) {
    try {
        const cache: Maybe<ExtensionCache> = yield getCachedState();
        logger.info(`[Worker] ${cache !== undefined ? 'Booting from cache' : 'Cache not found during boot'}`);

        const state = cache?.state ?? ((yield select()) as State);

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
    } catch (error) {
        logger.warn(error);
        yield put(bootFailure(error));

        onBoot?.({ ok: false });
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeLeading(boot.match, bootWorker, options);
}
