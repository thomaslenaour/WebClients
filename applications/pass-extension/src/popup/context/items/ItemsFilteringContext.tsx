import { createContext } from 'react';

import type { ItemType, MaybeNull } from '@proton/pass/types';
import noop from '@proton/utils/noop';

export type ItemsFilterOption = '*' | ItemType;
export const ITEM_LIST_SORT_OPTIONS = ['recent', 'titleASC', 'createTimeDESC', 'createTimeASC'] as const;
export type ItemsSortOption = (typeof ITEM_LIST_SORT_OPTIONS)[number];

export type ItemsFilteringContextType = {
    search: string;
    sort: ItemsSortOption;
    filter: ItemsFilterOption;
    vaultId: MaybeNull<string>;
    vaultBeingDeleted: MaybeNull<string>;
    setSearch: (query: string) => void;
    setSort: (value: ItemsSortOption) => void;
    setFilter: (value: ItemsFilterOption) => void;
    setVaultId: (vaultId: MaybeNull<string>) => void;
    setVaultBeingDeleted: (vaultId: MaybeNull<string>) => void;
};

export const INITIAL_SORT: ItemsSortOption = 'recent';

export const getInitialFilter = (autofillCandidates: boolean): ItemsFilterOption =>
    autofillCandidates ? 'login' : '*';

export const ItemsFilteringContext = createContext<ItemsFilteringContextType>({
    search: '',
    sort: INITIAL_SORT,
    filter: getInitialFilter(false),
    vaultId: null,
    vaultBeingDeleted: null,
    setSearch: noop,
    setSort: noop,
    setFilter: noop,
    setVaultId: noop,
    setVaultBeingDeleted: noop,
});
