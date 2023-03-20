import { createAction } from '@reduxjs/toolkit';

import { Notification } from '../with-notification';

export const notification = createAction('notification', (notification: Notification) => ({
    meta: { notification },
    payload: {},
}));
