import { createAction } from '@reduxjs/toolkit';

import withCacheBlock from '../with-cache-block';

export const itemAutofillIntent = createAction('item autofill intent', (payload: { itemId: string; shareId: string }) =>
    withCacheBlock({ payload })
);
