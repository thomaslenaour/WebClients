import { useContext } from 'react';

import { ItemsFilteringContext } from './ItemsFilteringContext';

export const useItemsFilteringContext = () => useContext(ItemsFilteringContext);
