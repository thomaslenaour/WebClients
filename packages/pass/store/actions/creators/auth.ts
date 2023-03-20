import { createAction } from '@reduxjs/toolkit';

export const signout = createAction('signout', (payload: { soft: boolean }) => ({ payload }));
export const signoutSuccess = createAction('signout success', (payload: { soft: boolean }) => ({ payload }));
