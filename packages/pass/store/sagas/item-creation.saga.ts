import { put, takeEvery } from 'redux-saga/effects';

import type { ItemRevision, ItemRevisionContentsResponse } from '@proton/pass/types';

import { itemCreationFailure, itemCreationIntent, itemCreationSuccess } from '../actions';
import type { WorkerRootSagaOptions } from '../types';
import { createAlias, createItem, parseItemRevision } from './workers/items';

function* itemCreationWorker({ onItemsChange }: WorkerRootSagaOptions, action: ReturnType<typeof itemCreationIntent>) {
    const {
        payload: createIntent,
        meta: { callback: onItemCreationIntentProcessed },
    } = action;
    const { shareId, optimisticId } = createIntent;

    const isAlias = createIntent.type === 'alias';

    try {
        const encryptedItem: ItemRevisionContentsResponse = yield isAlias
            ? createAlias(createIntent)
            : createItem(createIntent);

        const item: ItemRevision = yield parseItemRevision(shareId, encryptedItem);

        const itemCreationSuccessAction = itemCreationSuccess({ optimisticId, shareId, item });
        yield put(itemCreationSuccessAction);

        onItemCreationIntentProcessed?.(itemCreationSuccessAction);
        onItemsChange?.();
    } catch (e) {
        const itemCreationfailureAction = itemCreationFailure({ optimisticId, shareId }, e);
        yield put(itemCreationfailureAction);

        onItemCreationIntentProcessed?.(itemCreationfailureAction);
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeEvery(itemCreationIntent.match, itemCreationWorker, options);
}
