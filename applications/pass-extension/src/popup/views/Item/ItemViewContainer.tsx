import { type VFC, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
    selectByShareId,
    selectItemIdByOptimisticId,
    selectItemWithOptimistic,
    selectShareOrThrow,
} from '@proton/pass/store';
import selectFailedAction from '@proton/pass/store/optimistic/selectors/select-failed-action';
import type { ShareType } from '@proton/pass/types';
import { pipe } from '@proton/pass/utils/fp';
import { getOptimisticItemActionId } from '@proton/pass/utils/pass/items';

import { Panel } from '../../components/Panel/Panel';
import { useNavigationContext } from '../../context';
import { ItemView } from './Item/Item.view';

export const ItemViewContainer: VFC = () => {
    const { selectItem } = useNavigationContext();
    const { shareId, itemId } = useParams<{ shareId: string; itemId: string }>();

    const itemSelector = useMemo(() => selectItemWithOptimistic(shareId, itemId), [shareId, itemId]);
    const vault = useSelector(selectShareOrThrow<ShareType.Vault>(shareId));
    const item = useSelector(itemSelector);
    const itemIdFromOptimisticId = useSelector(selectItemIdByOptimisticId(itemId));

    const optimisticItemId = getOptimisticItemActionId({ itemId, shareId });
    const failedItemActionSelector = pipe(selectByShareId, selectFailedAction(optimisticItemId));
    const failure = useSelector(failedItemActionSelector);

    useEffect(() => {
        if (itemIdFromOptimisticId) {
            selectItem(shareId, itemIdFromOptimisticId);
        }
    }, [itemIdFromOptimisticId]);

    if (item !== undefined) {
        return <ItemView item={item} vault={vault} shareId={shareId} itemId={itemId} failureAction={failure?.action} />;
    }

    /**
     * when creating an item, we're synchronously redirected to the
     * ItemView - the creation sagas is non-blocking so we end
     * up in a temporary state where the we cannot select the item
     * from its optimisticId or its final id yet.
     */
    return <Panel />;
};
