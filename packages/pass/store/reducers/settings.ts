import { Reducer } from 'redux';

import { partialMerge } from '@proton/pass/utils/object';

import { sessionLockDisableSuccess, sessionLockEnableSuccess, sessionUnlockSuccess } from '../actions';

export type SettingsState = { sessionLockToken?: string; sessionLockTTL?: number };

const reducer: Reducer<SettingsState> = (state = {}, action) => {
    if (sessionLockEnableSuccess.match(action)) {
        return partialMerge(state, {
            sessionLockToken: action.payload.storageToken,
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
