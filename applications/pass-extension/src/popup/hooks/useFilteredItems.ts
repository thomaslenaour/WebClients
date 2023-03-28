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

export const useFilteredItems = ({ search, sort, filter, shareId }: ItemsFilteringContextType) => {
    const activeMatchOptions = useMemo(
        () => ({ shareId: shareId ?? undefined, needle: search, matchItem }),
        [search, shareId]
    );
    const activeItems = useSelector((state: State) => selectMatchItems(state, activeMatchOptions));
    const trashMatchOptions = useMemo(() => ({ needle: search, matchItem, trash: true }), [search]);
    const trashItems = useSelector((state: State) => selectMatchItems(state, trashMatchOptions));

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
                        Math.max(b.lastUseTime ?? b.modifyTime, b.modifyTime) -
                        Math.max(a.lastUseTime ?? a.modifyTime, a.modifyTime)
                    );
                case 'titleASC':
                    return a.data.metadata.name.localeCompare(b.data.metadata.name);
            }
        });
    }, [sort, filter, activeItems]);

    return { matched: activeItems, matchedTrash: trashItems, filtered: filteredItems };
};
