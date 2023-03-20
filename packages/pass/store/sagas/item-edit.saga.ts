import { call, put, select, takeEvery } from 'redux-saga/effects';

import { api } from '@proton/pass/api';
import { PassCrypto } from '@proton/pass/crypto';
import { ItemEditIntent, ItemRevision, ItemRevisionContentsResponse, OpenedItem } from '@proton/pass/types';
import { parseOpenedItem } from '@proton/pass/utils/protobuf';
import { isEqual } from '@proton/pass/utils/set/is-equal';

import { aliasDetailsEditSuccess, itemEditFailure, itemEditIntent, itemEditSuccess } from '../actions';
import { AliasState } from '../reducers';
import { selectAliasOptions, selectItemByShareIdAndId, selectMailboxesForAlias } from '../selectors';
import { WorkerRootSagaOptions } from '../types';
import { editItem } from './workers/items';

function* editMailboxesWorker(aliasEditIntent: ItemEditIntent<'alias'>) {
    const { itemId, shareId } = aliasEditIntent;

    const item: ItemRevision<'alias'> = yield select(selectItemByShareIdAndId(shareId, itemId));
    const mailboxesForAlias: string[] = yield select(selectMailboxesForAlias(item.aliasEmail!));
    const aliasOptions: AliasState['aliasOptions'] = yield select(selectAliasOptions);

    const currentMailboxIds = new Set(
        mailboxesForAlias
            .map((mailbox) => aliasOptions?.mailboxes.find(({ email }) => email === mailbox)?.id)
            .filter(Boolean) as number[]
    );

    const nextMailboxIds = new Set(aliasEditIntent.extraData.mailboxes.map(({ id }) => id));

    /* only update the mailboxes if there is a change */
    if (!isEqual(currentMailboxIds, nextMailboxIds)) {
        yield api({
            url: `pass/v1/share/${shareId}/alias/${itemId}/mailbox`,
            method: 'post',
            data: {
                MailboxIDs: Array.from(nextMailboxIds.values()),
            },
        });

        yield put(
            aliasDetailsEditSuccess({
                aliasEmail: item.aliasEmail!,
                mailboxes: aliasEditIntent.extraData.mailboxes,
            })
        );
    }
}
function* itemEditWorker(
    { onItemsChange }: WorkerRootSagaOptions,
    { payload: editIntent, meta: { callback: onItemEditIntentProcessed } }: ReturnType<typeof itemEditIntent>
) {
    const { itemId, shareId, lastRevision } = editIntent;

    try {
        if (editIntent.type === 'alias') {
            yield call(editMailboxesWorker, editIntent);
        }

        const encryptedItem: ItemRevisionContentsResponse = yield editItem(editIntent, lastRevision);
        const openedItem: OpenedItem = yield PassCrypto.openItem({ shareId, encryptedItem });
        const item: ItemRevision = parseOpenedItem({ openedItem, shareId });

        const itemEditSuccessAction = itemEditSuccess({ item, itemId, shareId });
        yield put(itemEditSuccessAction);

        onItemEditIntentProcessed?.(itemEditSuccessAction);
        onItemsChange?.();
    } catch (e) {
        const itemEditFailureAction = itemEditFailure({ itemId, shareId }, e);
        yield put(itemEditFailureAction);

        onItemEditIntentProcessed?.(itemEditFailureAction);
    }
}

export default function* watcher(options: WorkerRootSagaOptions) {
    yield takeEvery(itemEditIntent.match, itemEditWorker, options);
}
