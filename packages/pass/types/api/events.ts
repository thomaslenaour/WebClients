/**
 * TODO: add all server events
 * in this type definition - it only
 * specifies the keys we're consuming
 * in the extension sagas for now
 */
import { Address, User } from '@proton/shared/lib/interfaces';

import { PassEventListResponse } from './pass';

enum EventActions {
    DELETE,
    CREATE,
    UPDATE,
}

export type EventsChannelType = 'user' | 'share';

export type UserEvent = {
    More?: 0 | 1;
    EventID?: string;
    Refresh?: number;
    User?: User;
    Addresses?: {
        ID: string;
        Action: EventActions;
        Address: Address;
    }[];
};

export type ServerEvents =
    | ({ type: 'user' } & UserEvent)
    | ({ type: 'share' } & { Events: PassEventListResponse; shareId: string });

export type ServerEvent<T extends EventsChannelType = EventsChannelType> = Extract<ServerEvents, { type: T }>;

export enum ShareEventType {
    SHARE_DISABLED = 'SHARE_DISABLED',
    ITEMS_DELETED = 'ITEMS_DELETED',
}
