import { configureStore } from '@reduxjs/toolkit';
import devToolsEnhancer from 'remote-redux-devtools';

import { MessageWithOriginFactory } from '@proton/pass/extension/message';
import reducer from '@proton/pass/store/reducers';

import { ENV } from '../extension';
import { proxyActionsMiddleware } from './proxy-actions.middleware';

const createClientStore = (id: string, createMessage: MessageWithOriginFactory) => {
    const store = configureStore({
        reducer,
        middleware: [proxyActionsMiddleware(createMessage)],
        enhancers:
            ENV === 'development'
                ? [
                      devToolsEnhancer({
                          name: id,
                          port: 8000,
                          realtime: true,
                          secure: true,
                      }),
                  ]
                : [],
    });

    return store;
};

export default createClientStore;
