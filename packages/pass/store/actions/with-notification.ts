import { AnyAction } from 'redux';

import { ExtensionOrigin } from '@proton/pass/types';
import { merge } from '@proton/pass/utils/object';
import { getApiErrorMessage } from '@proton/shared/lib/api/helpers/apiErrorHelper';

type NotificationType = 'error' | 'success' | 'info';

export type Notification = {
    id?: string;
    expiry?: number;
    text: string;
    type: NotificationType;
    target?: ExtensionOrigin;
};

export type NotificationOptions = Notification & ({ type: 'error'; error: unknown } | { type: 'success' | 'info' });
export type WithNotification<T = AnyAction> = T & { meta: { notification: Notification } };

/* type guard utility */
export const isActionWithNotification = <T extends AnyAction>(action?: T): action is WithNotification<T> =>
    (action as any)?.meta?.notification !== undefined;

const parseNotification = (notification: NotificationOptions): Notification => {
    switch (notification.type) {
        case 'success':
        case 'info':
            return notification;
        case 'error': {
            const serializedNotification: Notification = {
                ...notification,
                text:
                    notification.error instanceof Error
                        ? getApiErrorMessage(notification.error) ?? notification.error?.message
                        : notification.text,
            };

            return serializedNotification;
        }
    }
};

const withNotification =
    (notification: NotificationOptions) =>
    <T extends object>(action: T): WithNotification<T> =>
        merge(action, { meta: { notification: parseNotification(notification) } });

export default withNotification;
