import { createAction } from '@reduxjs/toolkit';
import { c, msgid } from 'ttag';

import { ImportPayload } from '@proton/pass/import';
import { ItemRevision } from '@proton/pass/types';
import { pipe } from '@proton/pass/utils/fp';

import * as requests from '../requests';
import withNotification from '../with-notification';
import withRequest from '../with-request';

export const importItemsRequest = createAction('import items request', (payload: { data: ImportPayload }) =>
    withRequest({
        id: requests.importItems(),
        type: 'start',
    })({ payload })
);

export const importItemsRequestSuccess = createAction('import items success', ({ total }: { total: number }) =>
    pipe(
        withRequest({
            id: requests.importItems(),
            type: 'success',
        }),
        withNotification({
            type: 'info',
            target: 'page',
            text: c('Info').ngettext(msgid`Imported ${total} item`, `Imported ${total} items`, total),
        })
    )({ payload: { total } })
);

export const importItemsRequestFailure = createAction('import items failure', (error: unknown) =>
    pipe(
        withRequest({
            id: requests.importItems(),
            type: 'failure',
        }),
        withNotification({
            type: 'error',
            text: c('Error').t`Importing items failed`,
            error,
        })
    )({ payload: {}, error })
);

export const itemsImported = createAction('item imported', (payload: { shareId: string; items: ItemRevision[] }) => ({
    payload,
}));
