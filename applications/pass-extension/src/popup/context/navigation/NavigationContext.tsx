import { createContext } from 'react';

import { Maybe } from '@proton/pass/types';
import noop from '@proton/utils/noop';

export type SelectedItem = { shareId: string; itemId: string };
export type NavigationOptions = { inTrash?: boolean; action?: 'replace' | 'push' };

export type NavigationContextValue = {
    selectedItem: Maybe<SelectedItem>;
    selectItem: (shareId: string, itemId: string, options?: NavigationOptions) => void;
    unselectItem: (options?: NavigationOptions) => void;
    inTrash: boolean;
    isEditing: boolean;
    isCreating: boolean;
};

export const NavigationContext = createContext<NavigationContextValue>({
    selectedItem: undefined,
    selectItem: noop,
    unselectItem: noop,
    inTrash: false,
    isEditing: false,
    isCreating: false,
});
