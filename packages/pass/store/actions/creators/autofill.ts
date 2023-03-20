import { createAction } from '@reduxjs/toolkit';

export const itemAutofillIntent = createAction(
    'item autofill intent',
    (payload: { itemId: string; shareId: string }) => ({ payload })
);
