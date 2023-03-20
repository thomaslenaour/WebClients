import { Reducer } from 'redux';

import { merge, objectDelete } from '@proton/pass/utils/object';
import { toMap } from '@proton/shared/lib/helpers/object';
import { Address } from '@proton/shared/lib/interfaces';

import { bootSuccess, serverEvent } from '../actions';

/* TODO */
enum EventActions {
    DELETE,
    CREATE,
    UPDATE,
}
interface AddressEvent {
    ID: string;
    Action: EventActions;
    Address: Address;
}

export type AddressState = { [addressId: string]: Address };

const reducer: Reducer<AddressState> = (state = {}, action) => {
    if (bootSuccess.match(action) && action.payload.addresses) {
        return toMap(action.payload.addresses, 'ID');
    }

    if (serverEvent.match(action) && action.payload.event.type === 'user') {
        return ((action.payload.event.Addresses ?? []) as AddressEvent[]).reduce(
            (acc, { Action, ID, Address }) =>
                Action === EventActions.DELETE ? objectDelete(acc, ID) : merge(acc, { [ID]: Address }),
            state
        );
    }

    return state;
};

export default reducer;
