import { useEffect, useMemo } from 'react';

import { useShareEventEffect } from '../../../shared/hooks';
import { useItems } from '../../hooks/useItems';
import { useNavigationContext } from '../navigation/useNavigationContext';
import { usePopupContext } from '../popup/usePopupContext';
import type { ItemsFilteringContextType } from './ItemsFilteringContext';

export function handleVaultDeletionEffects(
    shareId: string,
    itemsFilteringVaultUtilities: {
        vaultId: ItemsFilteringContextType['vaultId'];
        vaultBeingDeleted: ItemsFilteringContextType['vaultBeingDeleted'];
        setVaultBeingDeleted: ItemsFilteringContextType['setVaultBeingDeleted'];
        setVaultId: ItemsFilteringContextType['setVaultId'];
    }
) {
    const { vaultId, vaultBeingDeleted, setVaultId, setVaultBeingDeleted } = itemsFilteringVaultUtilities;
    // ensure the currently selected item is not from this vault
    setVaultBeingDeleted(shareId);

    // ensure the currently selected vault is not this vault
    if (vaultId === vaultBeingDeleted) {
        setVaultId(null);
    }
}

export const ItemEffects = () => {
    const { ready } = usePopupContext();
    const { selectedItem, selectItem, unselectItem, isCreating, isEditing, inTrash } = useNavigationContext();
    const {
        filtering: { vaultId, vaultBeingDeleted, setVaultId, setVaultBeingDeleted },
        matchedTrash,
        filtered,
    } = useItems();

    const autoselect = !(isEditing || isCreating) && ready;

    useShareEventEffect(
        useMemo(
            () => ({
                onShareDisabled(shareId) {
                    handleVaultDeletionEffects(shareId, {
                        vaultId,
                        vaultBeingDeleted,
                        setVaultBeingDeleted,
                        setVaultId,
                    });
                },
                onItemsDeleted(shareId, itemIds) {
                    if (shareId === selectedItem?.shareId && itemIds.includes(selectedItem?.itemId)) {
                        unselectItem();
                    }
                },
            }),
            [vaultId, vaultBeingDeleted, selectedItem, unselectItem]
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
                selectedItem.shareId === vaultBeingDeleted ||
                !items.some(
                    ({ shareId, itemId }) => shareId === selectedItem.shareId && itemId === selectedItem.itemId
                );

            if (unselect) {
                unselectItem({ inTrash });
            }
        } else {
            if (autoselect) {
                const next = vaultBeingDeleted ? items.find(({ shareId }) => shareId !== vaultBeingDeleted) : items[0];

                if (next) {
                    const { shareId, itemId } = next;
                    selectItem(shareId, itemId, { action: 'replace', inTrash });
                }
            }

            if (vaultBeingDeleted) {
                setVaultBeingDeleted(null);
            }
        }
    }, [selectedItem, inTrash, items, autoselect, vaultBeingDeleted]);

    return null;
};
