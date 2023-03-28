import { useEffect, useMemo } from 'react';

import { useShareEventEffect } from '../../../shared/hooks';
import { useItems } from '../../hooks/useItems';
import { useNavigationContext } from '../navigation/useNavigationContext';
import { usePopupContext } from '../popup/usePopupContext';
import type { ItemsFilteringContextType } from './ItemsFilteringContext';

export function handleVaultDeletionEffects(
    shareId: string,
    itemsFilteringVaultUtilities: Pick<ItemsFilteringContextType, 'shareId' | 'setShareBeingDeleted' | 'setShareId'>
) {
    const { shareId: selectedShareId, setShareId, setShareBeingDeleted } = itemsFilteringVaultUtilities;
    // ensure the currently selected item is not from this vault
    setShareBeingDeleted(shareId);

    // ensure the currently selected vault is not this vault
    if (selectedShareId === shareId) {
        setShareId(null);
    }
}

export const ItemEffects = () => {
    const { ready } = usePopupContext();
    const { selectedItem, selectItem, unselectItem, isCreating, isEditing, inTrash } = useNavigationContext();
    const {
        filtering: { shareId, shareBeingDeleted, setShareId, setShareBeingDeleted },
        matchedTrash,
        filtered,
    } = useItems();

    const autoselect = !(isEditing || isCreating) && ready;

    useShareEventEffect(
        useMemo(
            () => ({
                onShareDisabled(shareId) {
                    handleVaultDeletionEffects(shareId, {
                        shareId,
                        setShareBeingDeleted,
                        setShareId,
                    });
                },
                onItemsDeleted(shareId, itemIds) {
                    if (shareId === selectedItem?.shareId && itemIds.includes(selectedItem?.itemId)) {
                        unselectItem();
                    }
                },
            }),
            [shareId, shareBeingDeleted, selectedItem, unselectItem]
        )
    );

    /**
     * FIXME:
     * Ideally, we wouldn't need to store the current item in any state,
     * apart from the shareId + itemId in the history location (~URL) params.
     * Auto-selection, would then just be a matter of `push` or `replace` the history,
     * from the currently filtered or trashed items (depending if we're viewing the items list or trash).
     */
    const items = inTrash ? matchedTrash : filtered;
    useEffect(() => {
        if (selectedItem) {
            const unselect =
                selectedItem.shareId === shareBeingDeleted ||
                !items.some(
                    ({ shareId, itemId }) => shareId === selectedItem.shareId && itemId === selectedItem.itemId
                );

            if (unselect) {
                unselectItem({ inTrash });
            }
        } else {
            if (autoselect) {
                const next = shareBeingDeleted ? items.find(({ shareId }) => shareId !== shareBeingDeleted) : items[0];

                if (next) {
                    const { shareId, itemId } = next;
                    selectItem(shareId, itemId, { action: 'replace', inTrash });
                }
            }

            if (shareBeingDeleted) {
                const stillItemsPendingDeletion = items.some(({ shareId }) => shareId === shareBeingDeleted);
                if (!stillItemsPendingDeletion) {
                    setShareBeingDeleted(null);
                }
            }
        }
    }, [selectedItem, inTrash, items, autoselect, shareBeingDeleted]);

    return null;
};
