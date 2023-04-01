import { eventChannel } from 'redux-saga';

import type { ServerEvent } from '@proton/pass/types';
import { ChannelType } from '@proton/pass/types';
import { merge } from '@proton/pass/utils/object/merge';
import createEventManager, { type EventManager } from '@proton/shared/lib/eventManager/eventManager';
import identity from '@proton/utils/identity';

import type { EventChannel, EventChannelOptions } from './types';

export const eventChannelFactory = <T extends ChannelType = ChannelType>(config: EventChannelOptions<T>) => {
    const { mapEvent = identity, onClose, type } = config;
    const manager: EventManager = createEventManager(config);

    return merge(config, {
        manager,
        channel: eventChannel<ServerEvent>((emitter) => {
            const unsubscribe = manager.subscribe((event) => emitter(mapEvent({ ...event, type })));

            return () => {
                onClose?.();
                unsubscribe();
                manager.stop();
                manager.reset();
            };
        }),
    }) as EventChannel<T>;
};

export const closeChannel = ({ channel }: EventChannel): void => {
    return channel.close();
};
