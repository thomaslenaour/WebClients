import { all, fork, takeEvery } from 'redux-saga/effects';

import type { Api, ServerEvent, SharesGetResponse } from '@proton/pass/types';
import { ChannelType } from '@proton/pass/types';
import { logId, logger } from '@proton/pass/utils/logger';
import { INTERVAL_EVENT_TIMER } from '@proton/shared/lib/constants';

import { vaultCreationSuccess } from '../../actions';
import type { WorkerRootSagaOptions } from '../../types';
import { eventChannelFactory } from './channel.factory';
import { getShareChannelForks } from './channel.share';
import { channelEventsWorker, channelWakeupWorker } from './channel.worker';

function* onSharesEvent(event: ServerEvent<ChannelType.SHARES>) {
    logger.info(`[Saga::SharesChannel]`, `${event.Shares.length} remote shares`);
}

const NOOP_EVENT = '*';

/* The event-manager can be used to implement
 * a polling mechanism if we conform to the data
 * structure it is expecting. In order to poll for
 * new shares, set the query accordingly & use a
 * non-existing eventID */
export const createSharesChannel = (api: Api) =>
    eventChannelFactory<ChannelType.SHARES>({
        api,
        type: ChannelType.SHARES,
        interval: INTERVAL_EVENT_TIMER,
        eventID: NOOP_EVENT,
        onClose: () => logger.info(`[Saga::SharesChannel] closing channel`),
        onEvent: onSharesEvent,
        query: () => ({
            url: 'pass/v1/share',
            method: 'get',
            mapResponse: (response: SharesGetResponse) => ({
                ...response,
                EventID: NOOP_EVENT,
                More: false,
            }),
        }),
    });

/* when a vault is created : recreate all the necessary
 * channels to start polling for this new share's events */
function* onNewShare(api: Api, options: WorkerRootSagaOptions) {
    yield takeEvery(vaultCreationSuccess.match, function* ({ payload: { share } }) {
        logger.info(`[Saga::SharesChannel] new share ${logId(share.shareId)} : start polling`);
        yield all(getShareChannelForks(api, options)(share));
    });
}

export function* sharesChannel(api: Api, options: WorkerRootSagaOptions) {
    const eventsChannel = createSharesChannel(api);
    const events = fork(channelEventsWorker<ChannelType.SHARES>, eventsChannel, options);
    const wakeup = fork(channelWakeupWorker<ChannelType.SHARES>, eventsChannel);
    const newVault = fork(onNewShare, api, options);

    yield all([events, wakeup, newVault]);
}
