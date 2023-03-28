import { type FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { type State, selectAutofillCandidates } from '@proton/pass/store';
import type { MaybeNull } from '@proton/pass/types';

import { usePopupContext } from '..';
import {
    INITIAL_SORT,
    type ItemsFilterOption,
    ItemsFilteringContext,
    type ItemsFilteringContextType,
    type ItemsSortOption,
    getInitialFilter,
} from './ItemsFilteringContext';

/**
 * Store all state related to filtering / sorting items in the UI.
 * To be used directly or in conjunction with high-level react hooks or low-level redux selectors.
 * This could be in a redux state slice instead, but for now using the redux store mainly for vault contents is preferred.
 */
export const ItemsFilteringContextProvider: FC = ({ children }) => {
    const { realm } = usePopupContext();

    const autofillCandidates = useSelector((state: State) => selectAutofillCandidates(state, realm));
    const hasCandidates = autofillCandidates.length > 0;

    const [search, setSearch] = useState<string>(realm && hasCandidates ? realm : '');
    const [sort, setSort] = useState<ItemsSortOption>(INITIAL_SORT);
    const [filter, setFilter] = useState<ItemsFilterOption>(getInitialFilter(hasCandidates));
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [shareId, setShareId] = useState<MaybeNull<string>>(null);
    const [shareBeingDeleted, setShareBeingDeleted] = useState<MaybeNull<string>>(null);

    // Memoize the context value to avoid unnecessarily re-rendering all context consumers when this component re-renders.
    const context: ItemsFilteringContextType = useMemo(
        () => ({
            search,
            sort,
            filter,
            shareId,
            shareBeingDeleted,
            setSearch,
            setSort,
            setFilter,
            setShareId,
            setShareBeingDeleted,
        }),
        [search, sort, filter, shareId, shareBeingDeleted]
    );

    return <ItemsFilteringContext.Provider value={context}>{children}</ItemsFilteringContext.Provider>;
};
