import { createContext } from 'react';

import type { Maybe, Realm } from '@proton/pass/types';
import noop from '@proton/utils/noop';

import { type ExtensionAppContextValue, INITIAL_WORKER_STATE } from '../../../shared/components/extension';

export interface PopupContextValue extends ExtensionAppContextValue {
    realm: Maybe<Realm>;
    subdomain: Maybe<string>;
    sync: () => void;
}

export const PopupContext = createContext<PopupContextValue>({
    state: INITIAL_WORKER_STATE,
    realm: undefined,
    subdomain: undefined,
    ready: false,
    logout: noop,
    lock: noop,
    sync: noop,
});
