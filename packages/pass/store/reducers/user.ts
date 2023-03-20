import { Reducer } from 'redux';

import { partialMerge } from '@proton/pass/utils/object';
import { User } from '@proton/shared/lib/interfaces';

import { bootSuccess, serverEvent } from '../actions';

export type UserState = User | null;

const reducer: Reducer<UserState> = (state = null, action) => {
    if (bootSuccess.match(action) && action.payload.user) {
        return action.payload.user;
    }

    if (serverEvent.match(action) && state !== null && action.payload.event.type === 'user') {
        return partialMerge(state, action.payload.event.User ?? {});
    }

    return state;
};

export default reducer;
