import { put, takeEvery } from 'redux-saga/effects';

import { api } from '@proton/pass/api';

import { itemDeleteFailure, itemDeleteIntent, itemDeleteSuccess } from '../actions';
import { WorkerRootSagaOptions } from '../types';

function* deleteItem({ onItemsChange }: WorkerRootSagaOptions, { payload }: ReturnType<typeof itemDeleteIntent>) {
    const { item, shareId } = payload;

    try {
        yield api({
            url: `pass/v1/share/${payload.shareId}/item`,
            method: 'delete',
            data: {
                Items: [
                    {
                        ItemID: item.itemId,
                        Revision: item.revision,
                    },
                ],
            },
        });

        yield put(itemDeleteSuccess({ itemId: item.itemId, shareId }));
        onItemsChange?.();
    } catch (e) {
        yield put(itemDeleteFailure({ itemId: item.itemId, shareId }, e));
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeEvery(itemDeleteIntent.match, deleteItem, options);
}
