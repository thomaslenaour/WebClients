import { createAction } from '@reduxjs/toolkit';
import { c } from 'ttag';

import withCallback, { ActionCallback } from '../with-callback';
import withNotification from '../with-notification';

export const emptyTrashIntent = createAction('trash delete intent');

export const emptyTrashFailure = createAction('item trash failure', (error: unknown) =>
    withNotification({
        type: 'error',
        text: c('Error').t`Emptying trash failed`,
        error,
    })({ payload: undefined, error })
);

export const emptyTrashSuccess = createAction('trash delete success', () =>
    withNotification({
        type: 'success',
        text: c('Info').t`All items permanently removed`,
    })({ payload: {} })
);

export const restoreTrashIntent = createAction(
    'restore trash intent',
    (callback?: ActionCallback<ReturnType<typeof restoreTrashSuccess> | ReturnType<typeof restoreTrashFailure>>) =>
        withCallback(callback)({ payload: {} })
);

export const restoreTrashFailure = createAction('restore trash failure', (error: unknown) =>
    withNotification({
        type: 'error',
        text: c('Error').t`Trashing item failed`,
        error,
    })({ payload: {}, error })
);

export const restoreTrashSuccess = createAction('restore trash success', () =>
    withNotification({
        type: 'success',
        text: c('Info').t`All items successfully restored`,
    })({ payload: {} })
);
