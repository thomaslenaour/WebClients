import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { type MatchItemsSelectorOptions, type State, selectMatchItems } from '@proton/pass/store';
import type { ItemRevisionWithOptimistic } from '@proton/pass/types';
import identity from '@proton/utils/identity';

import { matchItem } from '../../shared/items';
import type { ItemsFilteringContextType } from '../context/items/ItemsFilteringContext';

const filterBy =
    <T extends any[]>(predicate: (el: T[0]) => boolean) =>
    (arr: T) =>
        arr.filter(predicate as any);

export const useFilteredItems = ({ search, sort, filter, vaultId }: ItemsFilteringContextType) => {
    const matchOptions = useMemo<MatchItemsSelectorOptions>(
        () => ({ shareId: vaultId ?? undefined, needle: search, matchItem }),
        [search, vaultId]
    );

    const matchedItems = useSelector((state: State) => selectMatchItems(state, matchOptions));

    const filteredItems = useMemo<ItemRevisionWithOptimistic[]>(() => {
        const filterByType = filter === '*' ? identity : filterBy((item) => item.data.type === filter);

        return filterByType(matchedItems).sort((a, b) => {
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
    }, [sort, filter, matchedItems]);

    return { matched: matchedItems, filtered: filteredItems };
};
