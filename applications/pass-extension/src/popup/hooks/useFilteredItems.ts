import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { type State, selectMatchItems } from '@proton/pass/store';
import type { ItemRevisionWithOptimistic } from '@proton/pass/types';
import identity from '@proton/utils/identity';

import { matchItem } from '../../shared/items';
import type { ItemsFilteringContextType } from '../context/items/ItemsFilteringContext';

const filterBy =
    <T extends any[]>(predicate: (el: T[0]) => boolean) =>
    (arr: T) =>
        arr.filter(predicate as any);

export const useFilteredItems = ({ search, sort, filter, vaultId }: ItemsFilteringContextType) => {
    const activeMatchOptions = { shareId: vaultId ?? undefined, needle: search, matchItem };
    const activeItems = useSelector((state: State) => selectMatchItems(state, activeMatchOptions));

    const trashMatchOptions = { needle: search, matchItem, trash: true };
    const trashItems = useSelector((state: State) => selectMatchItems(state, trashMatchOptions)).sort(
        (a, b) => b.revisionTime - a.revisionTime
    );

    const filteredItems = useMemo<ItemRevisionWithOptimistic[]>(() => {
        const filterByType = filter === '*' ? identity : filterBy((item) => item.data.type === filter);

        return filterByType(activeItems).sort((a, b) => {
            switch (sort) {
                case 'createTimeASC':
                    return a.createTime - b.createTime;
                case 'createTimeDESC':
                    return b.createTime - a.createTime;
                case 'recent':
                    return (
                        Math.max(b.lastUseTime ?? b.revisionTime, b.revisionTime) -
                        Math.max(a.lastUseTime ?? a.revisionTime, a.revisionTime)
                    );
                case 'titleASC':
                    return a.data.metadata.name.localeCompare(b.data.metadata.name);
            }
        });
    }, [sort, filter, activeItems]);

    return { matched: activeItems, matchedTrash: trashItems, filtered: filteredItems };
};
