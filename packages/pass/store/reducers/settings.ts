import { Reducer } from 'redux';

import { or } from '@proton/pass/utils/fp';
import { partialMerge } from '@proton/pass/utils/object';

import { sessionLockDisableSuccess, sessionLockEnableSuccess, sessionLockSync, sessionUnlockSuccess } from '../actions';

export type SettingsState = { sessionLockToken?: string; sessionLockTTL?: number };

const reducer: Reducer<SettingsState> = (state = {}, action) => {
    if (or(sessionLockEnableSuccess.match, sessionLockSync.match)(action)) {
        /* on sessionLockSync we might not have a storageToken
         * available - this will most likely happen if a user
         * has registered a session lock but cannot boot from
         * cache - we fallback to an empty string for the user
         * settings to be in sync. In that case, the storage
         * token will be hydrated during the next unlock */
        return partialMerge(state, {
            sessionLockToken: action.payload.storageToken ?? '',
            sessionLockTTL: action.payload.ttl,
        });
    }

    if (sessionUnlockSuccess.match(action)) {
        return partialMerge(state, {
            sessionLockToken: action.payload.storageToken,
        });
    }

    if (sessionLockDisableSuccess.match(action)) {
        return {};
    }

    return state;
};

export default reducer;
