import type { EventChannel as ReduxSagaChannel } from 'redux-saga';

import type { Api, ApiOptions, ChannelType, ServerEvent } from '@proton/pass/types';
import type { EventManager } from '@proton/shared/lib/eventManager/eventManager';

import type { WorkerRootSagaOptions } from '../../types';

type BaseConfig<T extends ChannelType, Opts> = {
    api: Api;
    eventID: string;
    interval: number;
    query?: (eventId: string) => ApiOptions<void, any, any, any>;
    mapEvent?: (managerEvent: any) => ServerEvent<T>;
    onClose?: () => void;
    onEvent: (event: ServerEvent<T>, self: EventChannel<T>, options: Opts) => Generator;
    onError?: (error: unknown, self: EventChannel<T>, options: Opts) => Generator;
};

export type EventChannelOptions<T extends ChannelType = ChannelType> = BaseConfig<T, WorkerRootSagaOptions> &
    Extract<
        { type: ChannelType.USER } | { type: ChannelType.SHARES } | { type: ChannelType.SHARE; shareId: string },
        { type: T }
    >;

export type EventChannel<T extends ChannelType = any> = EventChannelOptions<T> & {
    manager: EventManager;
    channel: ReduxSagaChannel<ServerEvent<T>>;
};
