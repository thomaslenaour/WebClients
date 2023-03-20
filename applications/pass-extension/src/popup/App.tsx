import { NavigationContextProvider } from './context';
import { ItemEffects } from './context/items/ItemEffects';
import { ItemsFilteringContextProvider } from './context/items/ItemsFilteringContextProvider';
import { Main } from './views/Main';

export const App = () => {
    return (
        <NavigationContextProvider>
            <ItemsFilteringContextProvider>
                <ItemEffects />
                <Main />
            </ItemsFilteringContextProvider>
        </NavigationContextProvider>
    );
};
