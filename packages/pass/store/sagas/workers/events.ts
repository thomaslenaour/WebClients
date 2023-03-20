import { EventChannel, eventChannel } from 'redux-saga';

import { Api, ApiOptions, EventsChannelType, ServerEvent } from '@proton/pass/types/api';
import createEventManager, { EventManager } from '@proton/shared/lib/eventManager/eventManager';

type BaseConfig = {
    api: Api;
    eventID: string;
    interval?: number;
    query?: (eventId: string) => ApiOptions<undefined, any, any, any>;
};

type EventsChannelConfig<T extends EventsChannelType = EventsChannelType> = T extends 'share'
    ? BaseConfig & {
          type: 'share';
          shareId: string;
      }
    : BaseConfig & { type: 'user' };

export type EventsChannel<E extends ServerEvent = ServerEvent> = {
    config: EventsChannelConfig<E['type']>;
    manager: EventManager;
    channel: EventChannel<E>;
};

const createEventsChannel = <
    T extends EventsChannelConfig = EventsChannelConfig,
    E extends ServerEvent = ServerEvent<T extends EventsChannelConfig<infer U> ? U : never>
>(
    config: T
): EventsChannel<E> => {
    const manager: EventManager = createEventManager(config);

    return {
        config: config as EventsChannelConfig<E['type']>,
        manager,
        channel: eventChannel<E>((emitter) => {
            const unsubscribe = manager.subscribe((rawEvent) =>
                emitter(
                    (() => {
                        switch (config.type) {
                            case 'share': {
                                return {
                                    ...rawEvent,
                                    type: config.type,
                                    shareId: config.shareId,
                                };
                            }
                            case 'user': {
                                return {
                                    ...rawEvent,
                                    type: config.type,
                                };
                            }
                        }
                    })()
                )
            );

            /**
             * event channel subscribe function expects
             * an unsubscribe function as return type
             */
            return () => {
                unsubscribe();
                manager.stop();
                manager.reset();
            };
        }),
    };
};

export default createEventsChannel;
