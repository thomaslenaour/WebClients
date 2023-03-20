import { FC, useCallback, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { Maybe } from '@proton/pass/types';

import { NavigationContext, NavigationOptions, SelectedItem } from './NavigationContext';

export const NavigationContextProvider: FC = ({ children }) => {
    const history = useHistory();
    const [selectedItem, setSelectedItem] = useState<Maybe<SelectedItem>>(undefined);

    const inTrash = useRouteMatch('/trash') !== null;
    const isEditing = history.location.pathname.includes('/edit');
    const isCreating = history.location.pathname.includes('/new');

    const selectItem = useCallback((shareId: string, itemId: string, options?: NavigationOptions) => {
        setSelectedItem({ shareId, itemId });
        history[options?.action ?? 'push'](`${options?.inTrash ? '/trash' : ''}/share/${shareId}/item/${itemId}`);
    }, []);

    const unselectItem = useCallback((options?: NavigationOptions) => {
        setSelectedItem(undefined);
        history[options?.action ?? 'push'](options?.inTrash ? '/trash' : '');
    }, []);

    return (
        <NavigationContext.Provider
            value={{
                selectedItem,
                inTrash,
                isEditing,
                isCreating,
                selectItem,
                unselectItem,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
