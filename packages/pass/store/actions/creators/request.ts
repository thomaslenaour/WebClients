import { createAction } from '@reduxjs/toolkit';

export const acknowledge = createAction('acknowledge request', (requestId: string) => ({ payload: { requestId } }));
