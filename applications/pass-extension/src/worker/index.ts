import browser from 'webextension-polyfill';

import createApi, { exposeApi } from '@proton/pass/api';
import { getPersistedSession, setPersistedSession } from '@proton/pass/auth';
import { browserLocalStorage, browserSessionStorage } from '@proton/pass/extension/storage';
import { WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { getErrorMessage } from '@proton/pass/utils/errors';
import { logger } from '@proton/pass/utils/logger';
import sentry from '@proton/shared/lib/helpers/sentry';

import * as config from '../app/config';
import { ENV, RESUME_FALLBACK, createDevReloader } from '../shared/extension';
import WorkerMessageBroker from './channel';
import { createWorkerContext } from './context';

/* https://bugs.chromium.org/p/chromium/issues/detail?id=1271154#c66 */
const globalScope = self as any as ServiceWorkerGlobalScope;
globalScope.oninstall = () => globalScope.skipWaiting();

if (ENV === 'development') {
    createDevReloader(() => {
        /**
         * forward dev-server WS messages to content-scripts ports
         * since CSP policies may block our local WSServer
         */
        WorkerMessageBroker.ports.broadcast(
            { type: WorkerMessageType.DEV_SERVER, payload: { action: 'reload' } },
            (name) => name.includes('content-script')
        );
        WorkerMessageBroker.ports.disconnect();
        browser.runtime.reload();
    }, 'reloading chrome runtime');
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

WorkerMessageBroker.registerMessage(WorkerMessageType.RESOLVE_TAB, async (_, { tab }) => ({ tab }));
WorkerMessageBroker.registerMessage(WorkerMessageType.WORKER_INIT, async (message) =>
    (await context.init({ sync: message.payload.sync })).getState()
);

browser.runtime.onConnect.addListener(WorkerMessageBroker.ports.onConnect);
browser.runtime.onMessageExternal.addListener(WorkerMessageBroker.onMessage);
browser.runtime.onMessage.addListener(WorkerMessageBroker.onMessage);

/**
 * Try recovering the session when browser starts up
 * if any session was locally persisted
 * if not in production - use sync.html session to workaround the
 * the SSL handshake (net:ERR_SSL_CLIENT_AUTH_CERT_NEEDED)
 */
browser.runtime.onStartup.addListener(async () => {
    const { loggedIn } = (await context.init({ force: true })).getState();

    if (ENV === 'development' && RESUME_FALLBACK) {
        if (!loggedIn && (await getPersistedSession())) {
            const url = browser.runtime.getURL('/onboarding.html#/resume');
            return browser.windows.create({ url, type: 'popup', height: 600, width: 540 });
        }
    }
});

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'update') {
        /**
         * On extension update :
         * - Re-init so as to resume session as soon as possible
         * - In production : clear the state/snapshot cache in
         * order to gracefully handle any possible store structure
         * changes
         */
        if (ENV === 'production') {
            await browserLocalStorage.removeItems(['state', 'snapshot']);
        }

        return context.init({ force: true });
    }

    if (details.reason === 'install') {
        try {
            await Promise.all([browserLocalStorage.clear(), browserSessionStorage.clear()]);
            const url = browser.runtime.getURL('/onboarding.html#/success');
            await browser.tabs.create({ url });
        } catch (error: any) {
            logger.warn(`[Worker] requesting fork failed: ${getErrorMessage(error)}`);
        }

        await context.service.settings.init();
    }
});
