import type { AnyAction } from 'redux';
import type { EventChannel, Task } from 'redux-saga';
import { all, call, cancel, cancelled, fork, put, select, take } from 'redux-saga/effects';

import { api } from '@proton/pass/api';
import { PassCrypto } from '@proton/pass/crypto';
import type {
    OpenedItem,
    PassEventListResponse,
    ServerEvent,
    Share,
    ShareKeyResponse,
    TypedOpenedShare,
} from '@proton/pass/types';
import { ShareType } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { decodeVaultContent, parseOpenedItem } from '@proton/pass/utils/protobuf';
import { getLatestID } from '@proton/shared/lib/api/events';
import { getApiError } from '@proton/shared/lib/api/helpers/apiErrorHelper';

import {
    boot,
    bootSuccess,
    disabledShareEvent,
    itemDeleteSync,
    itemEditSync,
    serverEvent,
    signoutSuccess,
    vaultCreationSuccess,
    vaultDeleteSuccess,
    vaultEditSync,
    wakeupSuccess,
} from '../actions';
import { selectAllShares, selectEventId, selectShare } from '../selectors';
import { WorkerRootSagaOptions } from '../types';
import createEventsChannel, { EventsChannel } from './workers/events';
import { getAllShareKeys } from './workers/vaults';

/**
 * ⚠️ Important to call onShareEventItemsDeleted|onItemsChange before
 * actually dispatching the resulting action : we may be dealing
 * with a share or an item being selected in the pop-up and need
 * to run the side-effect before clearing the data from the store
 */
function* eventConsumer(
    event: ServerEvent & { error?: any },
    { onItemsChange, onShareEventItemsDeleted }: WorkerRootSagaOptions
) {
    if (event.error) {
        throw event.error;
    }

    switch (event.type) {
        case 'user':
            logger.info(`[ServerEvents::User] ${event.EventID?.slice(0, 10)}…`);
            return;
        case 'share': {
            const {
                Events: { LatestEventID, DeletedItemIDs, UpdatedItems, UpdatedShare },
                shareId,
            } = event;
            logger.info(`[ServerEvents::Share] ${LatestEventID.slice(0, 10)}… for share ${shareId.slice(0, 10)}…`);

            /* TODO: handle ItemShares when we support them */
            if (UpdatedShare && UpdatedShare.TargetType === ShareType.Vault) {
                const shareKeys: ShareKeyResponse[] = yield getAllShareKeys(UpdatedShare.ShareID);
                const share: TypedOpenedShare<ShareType.Vault> = yield PassCrypto.openShare({
                    encryptedShare: UpdatedShare,
                    shareKeys,
                });

                yield put(
                    vaultEditSync({
                        id: share.shareId,
                        share: {
                            shareId: share.shareId,
                            vaultId: share.vaultId,
                            targetId: share.targetId,
                            targetType: share.targetType,
                            content: decodeVaultContent(share.content),
                            eventId: LatestEventID,
                        },
                    })
                );
            }

            if (DeletedItemIDs.length > 0) {
                onShareEventItemsDeleted?.(event.shareId, DeletedItemIDs);
            }

            yield all([
                ...DeletedItemIDs.map((itemId) => put(itemDeleteSync({ itemId, shareId }))),
                ...UpdatedItems.map((encryptedItem) =>
                    call(function* () {
                        const openedItem: OpenedItem = yield PassCrypto.openItem({ shareId, encryptedItem });
                        yield put(
                            itemEditSync({
                                shareId: event.shareId,
                                itemId: openedItem.itemId,
                                item: parseOpenedItem({ openedItem, shareId }),
                            })
                        );
                    })
                ),
            ]);

            onItemsChange?.();
        }
    }
}

const createShareEventChannel = ({ shareId, eventId }: Share) =>
    createEventsChannel({
        type: 'share',
        shareId,
        eventID: eventId,
        query: (eventId) => {
            /**
             * The eventsManager does not support :
             * - setting a nested key for retrieving the eventID
             * - setting the key for the "More" property
             * => We need to lift the response to the correct type
             * by leveraging ApiOptions::mapResponse (see type
             * definition and create-api.ts for specs)
             */
            return {
                url: `pass/v1/share/${shareId}/event/${eventId}`,
                mapResponse: (response: { Events: PassEventListResponse }) => ({
                    ...response,
                    EventID: response.Events.LatestEventID,
                    More: response.Events.EventsPending,
                }),
            };
        },
        api,
    });

const closeChannel = ({ channel, config }: EventsChannel): void => {
    switch (config.type) {
        case 'user': {
            logger.info(`[ServerEvents::User] Closing event-loop channel`);
            break;
        }
        case 'share': {
            logger.info(`[ServerEvents::Share] Closing channel for share ${config.shareId.slice(0, 10)}…`);
            break;
        }
    }

    return channel.close();
};

const createEventChannelForks = (eventsChannel: EventsChannel, options: WorkerRootSagaOptions) => {
    const { channel, manager, config } = eventsChannel;

    return [
        fork(function* channelWorker() {
            try {
                while (true) {
                    const event = (yield take(channel as EventChannel<ServerEvent>)) as ServerEvent;
                    try {
                        yield call(eventConsumer, event, options);
                        yield put(serverEvent(event));
                    } catch (error: any) {
                        const { code } = getApiError(error);

                        /* share was deleted or user lost access */
                        if (eventsChannel.config.type === 'share' && code === 300004) {
                            closeChannel(eventsChannel);

                            const { shareId } = eventsChannel.config;
                            const share = (yield select(selectShare(shareId))) as Share;

                            options.onShareEventDisabled?.(share.shareId);
                            yield put(disabledShareEvent(share));
                        }
                        /* handle share deleted error here */
                        logger.warn(`[EventConsumer] ${error?.name}`);
                    }
                }
            } finally {
                if (yield cancelled()) {
                    closeChannel(eventsChannel);
                }
            }
        }),
        /**
         * Call the event manager immediately
         * as soon as we fork this saga and on
         * every wakeupSuccess action coming from
         * the pop-up in order to sync as soon as
         * possible
         */
        fork(function* () {
            try {
                yield call(manager.call);
                while (
                    yield take(
                        (action: AnyAction) => wakeupSuccess.match(action) && action.payload.endpoint === 'popup'
                    )
                ) {
                    yield call(manager.call);
                }
            } catch (_) {}
        }),
        /* close share channel upon vault deletion */
        ...(config.type === 'share'
            ? [
                  fork(function* () {
                      while (
                          yield take(
                              (action: AnyAction) =>
                                  vaultDeleteSuccess.match(action) && action.payload.id === config.shareId
                          )
                      ) {
                          closeChannel(eventsChannel);
                      }
                  }),
              ]
            : []),
    ];
};

function* eventsWorker(options: WorkerRootSagaOptions): Generator {
    /**
     * Latest global eventID is stored in the events
     * sub-state whereas each share keep track of their
     * current latest event id
     */
    const eventID =
        ((yield select(selectEventId)) as ReturnType<typeof selectEventId>) ??
        ((yield api(getLatestID())) as { EventID: string }).EventID;

    const shares = (yield select(selectAllShares)) as Share[];
    const channels = [createEventsChannel({ type: 'user', eventID, api }), ...shares.map(createShareEventChannel)];

    yield all([
        ...channels.map((channel) => createEventChannelForks(channel, options)).flat(),
        fork(function* () {
            while (true) {
                /* Start a new events channel upon new vault creation */
                const vaultCreated: ReturnType<typeof vaultCreationSuccess> = yield take(vaultCreationSuccess);
                const channel = createShareEventChannel(vaultCreated.payload.share);
                yield all(createEventChannelForks(channel, options));
            }
        }),
    ]);
}

export default function* watcher(options: WorkerRootSagaOptions): Generator {
    while (yield take(bootSuccess.match)) {
        const events = (yield fork(eventsWorker, options)) as Task;
        /**
         * Cancel the events saga on any new boot action
         * and on signoutSuccess - we cannot rely on the signout action
         * here as it is dispatched on every InvalidSession API
         * error which may happen inside the eventManager's internal
         * queries - this would result in the eventManager not being
         * stopped properly because of a race condition created by the
         * manager being "closed" while still processing the API error.
         * This would lead to it never fully stopping because
         * of its `start()` call in its internal `catch` block
         * (see packages/shared/lib/eventManager/eventManager.ts#L182)
         *
         * TODO: handle InvalidSession error in eventsManager to avoid this ?
         */
        yield take([boot.match, signoutSuccess.match]);
        yield cancel(events);
    }
}
