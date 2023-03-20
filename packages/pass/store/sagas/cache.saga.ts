import { select, take } from 'redux-saga/effects';

import { authentication } from '@proton/pass/auth/authentication';
import { PassCrypto } from '@proton/pass/crypto';
import { CACHE_SALT_LENGTH, encryptData, getCacheEncryptionKey } from '@proton/pass/crypto/utils';
import { browserLocalStorage } from '@proton/pass/extension/storage';
import { EncryptionTag } from '@proton/pass/types';
import { invert, or } from '@proton/pass/utils/fp/predicates';
import { objectDelete } from '@proton/pass/utils/object';
import { stringToUint8Array, uint8ArrayToString } from '@proton/shared/lib/helpers/encoding';

import { boot, bootFailure, notification, signout, signoutSuccess, wakeup, wakeupSuccess } from '../actions';
import { asIfNotOptimistic } from '../optimistic/selectors/select-is-optimistic';
import { reducerMap } from '../reducers';
import { State } from '../types';

const CACHE_BLOCK_ACTIONS = [
    boot.match,
    bootFailure.match,
    wakeup.match,
    wakeupSuccess.match,
    signout.match,
    signoutSuccess.match,
    notification.match,
];

function* cacheWorker() {
    if (authentication?.hasSession()) {
        try {
            const cacheSalt = crypto.getRandomValues(new Uint8Array(CACHE_SALT_LENGTH));
            const key: CryptoKey = yield getCacheEncryptionKey(cacheSalt);

            const state = (yield select()) as State;
            const nonOptimisticState = asIfNotOptimistic(state, reducerMap);
            const whiteListedState = objectDelete(nonOptimisticState, 'request');

            const encoder = new TextEncoder();
            const stringifiedState = JSON.stringify(whiteListedState);
            const encryptedData: Uint8Array = yield encryptData(
                key,
                encoder.encode(stringifiedState),
                EncryptionTag.Cache
            );

            const workerSnapshot = PassCrypto.serialize();
            const stringifiedSnapshot = JSON.stringify(workerSnapshot);

            const encryptedWorkerSnapshot: Uint8Array = yield encryptData(
                key,
                stringToUint8Array(stringifiedSnapshot),
                EncryptionTag.Cache
            );

            yield browserLocalStorage.setItem('salt', uint8ArrayToString(cacheSalt));
            yield browserLocalStorage.setItem('state', uint8ArrayToString(encryptedData));
            yield browserLocalStorage.setItem('snapshot', uint8ArrayToString(encryptedWorkerSnapshot));
        } catch (_) {}
    }
}

export default function* watcher(): Generator {
    while (yield take(invert(or(...CACHE_BLOCK_ACTIONS)))) {
        yield cacheWorker();
    }
}
