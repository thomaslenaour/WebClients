import { useSelector } from 'react-redux';

import { selectAllTrashedItems } from '@proton/pass/store';

export const useTrashedItems = () => {
    return useSelector(selectAllTrashedItems);
};
