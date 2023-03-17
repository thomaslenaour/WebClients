import { createAction } from '@reduxjs/toolkit';

import withCacheBlock from '../with-cache-block';

export const acknowledge = createAction('acknowledge request', (requestId: string) =>
    withCacheBlock({ payload: { requestId } })
);
