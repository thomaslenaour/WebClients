import { useItemsFilteringContext } from '../context/items/useItemsFilteringContext';
import { useFilteredItems } from './useFilteredItems';

export const useItems = () => {
    const filtering = useItemsFilteringContext();
    const { matched, matchedTrash, filtered } = useFilteredItems(filtering);
    return { filtering, filtered, matched, matchedTrash };
};
