import { useContext } from 'react';

import { PopupContext } from './PopupContext';

export const usePopupContext = () => useContext(PopupContext);
