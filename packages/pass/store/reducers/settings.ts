import { Reducer } from 'redux';

import { or } from '@proton/pass/utils/fp';
import { partialMerge } from '@proton/pass/utils/object';

import { sessionLockDisableSuccess, sessionLockEnableSuccess, sessionUnlockSuccess } from '../actions';

export type SettingsState = { sessionLockEnabled: boolean; sessionLockToken: null | string };
const INITIAL_STATE: SettingsState = { sessionLockEnabled: false, sessionLockToken: null };

const reducer: Reducer<SettingsState> = (state = INITIAL_STATE, action) => {
    if (or(sessionLockEnableSuccess.match, sessionUnlockSuccess.match)(action)) {
        return partialMerge(state, { sessionLockEnabled: true, sessionLockToken: action.payload.storageToken });
    }

    if (sessionLockDisableSuccess.match(action)) {
        return partialMerge(state, { sessionLockEnabled: false, sessionLockToken: null });
    }

    return state;
};

export default reducer;
