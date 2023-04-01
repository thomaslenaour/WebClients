/* eslint-disable curly, @typescript-eslint/no-throw-literal */
import type { Task } from 'redux-saga';
import { all, cancel, fork, take } from 'redux-saga/effects';

import { api } from '@proton/pass/api';

import { boot, bootSuccess, signoutSuccess, stateLock } from '../actions';
import type { WorkerRootSagaOptions } from '../types';
import { shareChannels } from './events/channel.share';
import { sharesChannel } from './events/channel.shares';
import { userChannel } from './events/channel.user';

function* eventsWorker(options: WorkerRootSagaOptions): Generator {
    yield all([userChannel, shareChannels, sharesChannel].map((effect) => fork(effect, api, options)));
}

export default function* watcher(options: WorkerRootSagaOptions): Generator {
    while (yield take(bootSuccess.match)) {
        const events = (yield fork(eventsWorker, options)) as Task;
        yield take([boot.match, signoutSuccess.match, stateLock.match]);
        yield cancel(events);
    }
}
