import { useContext } from 'react';

import { ExtensionAppContext } from '../components/extension/ExtensionContextProvider';

export const useExtensionContext = () => useContext(ExtensionAppContext);
