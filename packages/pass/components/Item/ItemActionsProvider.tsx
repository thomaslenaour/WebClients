import { type FC, type PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { c } from 'ttag';

import { useBulkSelect } from '@proton/pass/components/Bulk/BulkSelectProvider';
import { useNavigation } from '@proton/pass/components/Navigation/NavigationProvider';
import { VaultSelect, VaultSelectMode, useVaultSelectModalHandles } from '@proton/pass/components/Vault/VaultSelect';
import {
    itemBulkDeleteIntent,
    itemBulkMoveIntent,
    itemBulkRestoreIntent,
    itemBulkTrashIntent,
    itemDeleteIntent,
    itemMoveIntent,
    itemRestoreIntent,
    itemTrashIntent,
} from '@proton/pass/store/actions';
import type { BulkSelectionDTO, ItemRevision, MaybeNull } from '@proton/pass/types';
import { uniqueId } from '@proton/pass/utils/string/unique-id';

/** Ongoing: move every item action definition to this
 * context object. This context should be loosely connected */
type ItemActionsContextType = {
    delete: (item: ItemRevision) => void;
    deleteMany: (items: BulkSelectionDTO) => void;
    move: (item: ItemRevision, mode: VaultSelectMode) => void;
    moveMany: (items: BulkSelectionDTO) => void;
    restore: (item: ItemRevision) => void;
    restoreMany: (items: BulkSelectionDTO) => void;
    trash: (item: ItemRevision) => void;
    trashMany: (items: BulkSelectionDTO) => void;
};

const ItemActionsContext = createContext<MaybeNull<ItemActionsContextType>>(null);

export const ItemActionsProvider: FC<PropsWithChildren> = ({ children }) => {
    const { selectItem } = useNavigation();
    const dispatch = useDispatch();
    const bulk = useBulkSelect();

    const { closeVaultSelect, openVaultSelect, modalState } = useVaultSelectModalHandles();

    const moveItem = (item: ItemRevision) => (destinationShareId: string) => {
        const optimisticId = uniqueId();
        dispatch(itemMoveIntent({ item, shareId: destinationShareId, optimisticId }));
        selectItem(destinationShareId, optimisticId, {
            mode: 'replace',
            filters: { selectedShareId: destinationShareId },
        });
        closeVaultSelect();
    };

    const moveManyItems = (selected: BulkSelectionDTO) => (destinationShareId: string) => {
        dispatch(itemBulkMoveIntent({ selected, destinationShareId }));
        bulk.disable();
        closeVaultSelect();
    };

    const trashItem = (item: ItemRevision) => {
        dispatch(itemTrashIntent({ itemId: item.itemId, shareId: item.shareId, item }));
    };

    const trashManyItems = (selected: BulkSelectionDTO) => {
        dispatch(itemBulkTrashIntent({ selected }));
        bulk.disable();
    };

    const deleteItem = (item: ItemRevision) => {
        dispatch(itemDeleteIntent({ itemId: item.itemId, shareId: item.shareId, item }));
    };

    const deleteManyItems = (selected: BulkSelectionDTO) => {
        dispatch(itemBulkDeleteIntent({ selected }));
        bulk.disable();
    };

    const restoreItem = (item: ItemRevision) => {
        dispatch(itemRestoreIntent({ itemId: item.itemId, shareId: item.shareId, item }));
    };

    const restoreManyItems = (selected: BulkSelectionDTO) => {
        dispatch(itemBulkRestoreIntent({ selected }));
        bulk.disable();
    };

    const context = useMemo<ItemActionsContextType>(() => {
        return {
            move: (item, mode) =>
                openVaultSelect({
                    mode,
                    shareId: item.shareId,
                    onSubmit: moveItem(item),
                }),
            moveMany: (selected) =>
                openVaultSelect({
                    mode: VaultSelectMode.Writable,
                    shareId: '' /* allow all vaults */,
                    onSubmit: moveManyItems(selected),
                }),
            trash: trashItem,
            trashMany: trashManyItems,
            delete: deleteItem,
            deleteMany: deleteManyItems,
            restore: restoreItem,
            restoreMany: restoreManyItems,
        };
    }, []);

    return (
        <ItemActionsContext.Provider value={context}>
            {children}
            <VaultSelect
                downgradeMessage={c('Info')
                    .t`You have exceeded the number of vaults included in your subscription. Items can only be moved to your first two vaults. To move items between all vaults upgrade your subscription.`}
                onClose={closeVaultSelect}
                {...modalState}
            />
        </ItemActionsContext.Provider>
    );
};

export const useItemsActions = (): ItemActionsContextType => useContext(ItemActionsContext)!;
