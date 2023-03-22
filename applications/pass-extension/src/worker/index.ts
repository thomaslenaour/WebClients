import browser from 'webextension-polyfill';

import createApi, { exposeApi } from '@proton/pass/api';
import { getPersistedSession, setPersistedSession } from '@proton/pass/auth';
import { browserSessionStorage } from '@proton/pass/extension/storage';
import { WorkerStatus } from '@proton/pass/types';
import sentry from '@proton/shared/lib/helpers/sentry';

import * as config from '../app/config';
import WorkerMessageBroker from './channel';
import { createWorkerContext } from './context';

if (BUILD_TARGET === 'chrome') {
    /* https://bugs.chromium.org/p/chromium/issues/detail?id=1271154#c66 */
    const globalScope = self as any as ServiceWorkerGlobalScope;
    globalScope.oninstall = () => globalScope.skipWaiting();
}

sentry({
    config,
    sentryConfig: {
        host: new URL(config.API_URL).host,
        release: config.APP_VERSION,
        environment: `browser-pass::worker`,
    },
    ignore: () => false,
});

const api = exposeApi(
    createApi({
        config,
        onSessionRefresh: async ({ AccessToken, RefreshToken }) => {
            const persistedSession = await getPersistedSession();
            if (persistedSession) {
                await Promise.all([
                    setPersistedSession({ ...persistedSession, AccessToken, RefreshToken }),
                    browserSessionStorage.setItems({ AccessToken, RefreshToken }),
                ]);
            }
        },
    })
);

const context = createWorkerContext({ api, status: WorkerStatus.IDLE });

browser.runtime.onConnect.addListener(WorkerMessageBroker.ports.onConnect);
browser.runtime.onMessageExternal.addListener(WorkerMessageBroker.onMessage);
browser.runtime.onMessage.addListener(WorkerMessageBroker.onMessage);
browser.runtime.onStartup.addListener(context.service.activation.onStartup);
browser.runtime.onInstalled.addListener(context.service.activation.onInstall);
