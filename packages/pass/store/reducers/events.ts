import { AnyAction, Reducer } from 'redux';

import { Maybe } from '@proton/pass/types';

import { serverEvent } from '../actions';

export type EventsState = { eventId: Maybe<string> };

const reducer: Reducer<EventsState> = (state = { eventId: undefined }, action: AnyAction) => {
    if (serverEvent.match(action) && action.payload.event.type === 'user') {
        return { eventId: action.payload.event.EventID };
    }

    return state;
};

export default reducer;
