import { Reducer } from 'redux';

import { or } from '@proton/pass/utils/fp';

import { sessionLockDisableSuccess, sessionLockEnableSuccess, sessionUnlockSuccess } from '../actions';

export type SettingsState = { sessionLockToken?: string };

const reducer: Reducer<SettingsState> = (state = {}, action) => {
    if (or(sessionLockEnableSuccess.match, sessionUnlockSuccess.match)(action)) {
        return { sessionLockToken: action.payload.storageToken };
    }

    if (sessionLockDisableSuccess.match(action)) {
        return {};
    }

    return state;
};

export default reducer;
