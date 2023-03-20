import { ExtensionOrigin, Maybe, TabId } from '@proton/pass/types';
import { invert } from '@proton/pass/utils/fp/predicates';

import { boot, syncing, wakeup } from '../actions/requests';
import { RequestType } from '../actions/with-request';
import { RequestEntry } from '../reducers/request';
import { State } from '../types';

export const selectRequest =
    (namespaceOrId: string) =>
    ({ request }: State): Maybe<RequestEntry> =>
        request?.[namespaceOrId];

export const selectRequestStatus =
    (namespaceOrId: string) =>
    ({ request }: State): Maybe<RequestType> =>
        request?.[namespaceOrId]?.status;

export const selectRequestInFlight =
    (namespaceOrId: string) =>
    (state: State): boolean =>
        selectRequestStatus(namespaceOrId)(state) === 'start';

export const selectWorkerAlive = (origin: ExtensionOrigin, tabId: TabId) =>
    invert(selectRequestInFlight(wakeup(origin, tabId)));

export const selectWorkerSyncing = selectRequestInFlight(syncing());
export const selectBooting = selectRequestInFlight(boot());
