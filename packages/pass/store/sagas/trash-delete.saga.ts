import { AnyAction } from 'redux';
import { all, fork, put, select, take } from 'redux-saga/effects';

import { api } from '@proton/pass/api';
import { ItemRevision } from '@proton/pass/types';
import groupWith from '@proton/utils/groupWith';

import { emptyTrashFailure, emptyTrashIntent, emptyTrashSuccess } from '../actions';
import { selectAllTrashedItems } from '../selectors';
import { WorkerRootSagaOptions } from '../types';

function* deleteTrash(trashedItems: ItemRevision[], { onItemsChange }: WorkerRootSagaOptions) {
    const groupedByShareId = groupWith((a, b) => a.shareId === b.shareId, trashedItems);

    try {
        yield all(
            groupedByShareId.map((items) =>
                api({
                    url: `pass/v1/share/${items[0].shareId}/item`,
                    method: 'delete',
                    data: {
                        Items: items.map(({ itemId, revision }) => ({ ItemID: itemId, Revision: revision })),
                    },
                })
            )
        );

        yield put(emptyTrashSuccess());
        onItemsChange?.();
    } catch (e) {
        yield put(emptyTrashFailure(e));
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    /**
     * In redux-saga, reducers are processed before sagas, which makes for the "select()" effect to return
     * the state after the action has gone through the reducers as opposed to before that.
     *
     * Since we delete the trashed items optimistically on trash delete intent, when we try to get them
     * inside this saga, select will return the state with those items missing already. We therefore keep
     * the previous value of the selector "selectAllTrashedItems" and pass it to the saga on action match.
     */
    while (true) {
        let trashedItems: ReturnType<typeof selectAllTrashedItems> = yield select(selectAllTrashedItems);

        const action: AnyAction = yield take('*');

        if (emptyTrashIntent.match(action)) {
            yield fork(deleteTrash, trashedItems, options);
        } else {
            trashedItems = yield select(selectAllTrashedItems);
        }
    }
}
