import { useContext } from 'react';

import { NavigationContext } from './NavigationContext';

export const useNavigationContext = () => useContext(NavigationContext);
