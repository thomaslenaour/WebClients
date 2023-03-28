import { AnyAction } from 'redux';
import { put, takeEvery } from 'redux-saga/effects';

import { logger } from '@proton/pass/utils/logger';
import { wait } from '@proton/shared/lib/helpers/promise';

import { acknowledge } from '../actions';
import { RequestType, WithRequest, isActionWithRequest } from '../actions/with-request';

const ACK_TIMEOUT = 150;
const ACK_FLAGS: RequestType[] = ['success', 'failure'];

function* requestWorker(action: WithRequest<AnyAction>) {
    const { request } = action.meta;

    if (ACK_FLAGS.includes(request.type)) {
        yield wait(ACK_TIMEOUT);
        logger.info(`[Saga::Request] Acknowledging request "${request.id}"`);
        yield put(acknowledge(request.id));
    }
}

export default function* watcher() {
    yield takeEvery(isActionWithRequest, requestWorker);
}
