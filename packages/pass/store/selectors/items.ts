import { createSelector } from '@reduxjs/toolkit';

import type { Item, ItemRevision, ItemRevisionWithOptimistic, Maybe } from '@proton/pass/types';
import { invert } from '@proton/pass/utils/fp';
import { isTrashed } from '@proton/pass/utils/pass/trash';
import { matchLoginItemsByUrl } from '@proton/pass/utils/search';

import { unwrapOptimisticState } from '../optimistic/utils/transformers';
import { withOptimisticItemsByShareId } from '../reducers/items';
import { State } from '../types';

const flattenItemsByShareId = (itemsByShareId: {
    [shareId: string]: { [itemId: string]: ItemRevision };
}): ItemRevision[] => Object.values(itemsByShareId).flatMap(Object.values);

export const selectByShareId = (state: State) => state.items.byShareId;
export const selectByOptimisticIds = (state: State) => state.items.byOptimistcId;
export const selectItems = createSelector([selectByShareId], unwrapOptimisticState);
export const selectAllItems = createSelector(selectItems, flattenItemsByShareId);
export const selectAllTrashedItems = createSelector([selectAllItems], (items) =>
    items.filter(isTrashed).sort((a, b) => b.revisionTime - a.revisionTime)
);

export const selectItemsByShareId = createSelector(
    [selectItems, (_: State, shareId?: string) => shareId],
    (items, shareId) =>
        flattenItemsByShareId(shareId && items[shareId] ? { shareId: items[shareId] } : items).filter(invert(isTrashed))
);

export const selectItemIdByOptimisticId = (optimisticItemId: string) => (state: State) =>
    selectByOptimisticIds(state)[optimisticItemId];

export const selectItemByShareIdAndId = (shareId: string, itemId: string) =>
    createSelector([selectItems, selectByOptimisticIds], (items, byOptimisticId): Maybe<ItemRevision> => {
        const idFromOptimisticId = byOptimisticId[itemId];
        const byItemId = items[shareId];

        return idFromOptimisticId ? byItemId?.[idFromOptimisticId] : byItemId?.[itemId];
    });

const { asIfNotFailed, asIfNotOptimistic } = withOptimisticItemsByShareId.selectors;
export const selectByShareIdAsIfNotFailed = createSelector(selectByShareId, asIfNotFailed);
export const selectByShareIdAsIfNotOptimistic = createSelector(selectByShareId, asIfNotOptimistic);

export const selectItemsWithOptimistic = createSelector(
    [selectAllItems, selectByShareIdAsIfNotFailed, selectByShareIdAsIfNotOptimistic],
    (items, withoutFailed, withoutOptimistic) => {
        return items.map(
            (item): ItemRevisionWithOptimistic => ({
                ...item,
                failed: withoutFailed[item.shareId]?.[item.itemId]?.revision !== item.revision,
                optimistic: withoutOptimistic[item.shareId]?.[item.itemId]?.revision !== item.revision,
            })
        );
    }
);

export const selectItemWithOptimistic = (shareId: string, itemId: string) =>
    createSelector(
        [selectItemByShareIdAndId(shareId, itemId), selectByShareIdAsIfNotFailed, selectByShareIdAsIfNotOptimistic],
        (item, withoutFailed, withoutOptimistic): Maybe<ItemRevisionWithOptimistic> =>
            item
                ? {
                      ...item,
                      failed: withoutFailed[item.shareId]?.[item.itemId]?.revision !== item.revision,
                      optimistic: withoutOptimistic[item.shareId]?.[item.itemId]?.revision !== item.revision,
                  }
                : undefined
    );

/**
 * SEARCH SELECTORS
 * selectMatchItems : select all items by needle
 * selectAutofillCandidates : select login items by url
 */

export type MatchItemsSelectorOptions = {
    shareId?: string;
    needle?: string;
    matchItem: (item: Item) => (searchTerm: string) => boolean;
};

export const selectMatchItems = createSelector(
    [selectItemsWithOptimistic, (_: State, options: MatchItemsSelectorOptions) => options],
    (items, { shareId, needle = '', matchItem }) =>
        (needle.trim() === '' ? items : items.filter((item) => matchItem(item.data)(needle))).filter(
            (item) => (!shareId || shareId === item.shareId) && !isTrashed(item)
        )
);

export const selectAutofillCandidates = createSelector(
    [selectItemsWithOptimistic, (_: State, url?: string) => url],
    (items, url = '') =>
        (Boolean(url)
            ? items
                  .filter((item) => !isTrashed(item) && !item.optimistic && matchLoginItemsByUrl(item.data)(url))
                  .sort((a, b) => (b.lastUseTime ?? b.revisionTime) - (a.lastUseTime ?? a.revisionTime))
            : []) as ItemRevision<'login'>[]
);
