import { createAction } from '@reduxjs/toolkit';
import { c } from 'ttag';

import { ItemRevision, Share } from '@proton/pass/types';
import { pipe } from '@proton/pass/utils/fp';

import * as requests from '../requests';
import withNotification from '../with-notification';
import withRequest from '../with-request';

export const sharesRequested = createAction('shares requested', () =>
    withRequest({ id: requests.shares(), type: 'start' })({ payload: {} })
);

export const sharesRequestFailure = createAction('shares request failure', (error: unknown) =>
    pipe(
        withRequest({
            id: requests.shares(),
            type: 'failure',
        }),
        withNotification({
            type: 'error',
            text: c('Error').t`Requesting shares failed`,
            error,
        })
    )({ payload: {}, error })
);

export const sharesRequestSuccess = createAction(
    'shares request success',
    (payload: { shares: Share[]; itemsByShareId: { [id: string]: ItemRevision[] } }) =>
        withRequest({
            id: requests.shares(),
            type: 'success',
        })({ payload })
);
