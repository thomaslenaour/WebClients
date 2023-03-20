import { useItemsFilteringContext } from '../context/items/useItemsFilteringContext';
import { useFilteredItems } from './useFilteredItems';
import { useTrashedItems } from './useTrashedItems';

export const useItems = () => {
    const filtering = useItemsFilteringContext();
    const { matched, filtered } = useFilteredItems(filtering);
    const trashed = useTrashedItems();
    return { filtering, matched, filtered, trashed };
};
