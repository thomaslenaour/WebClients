import browser from 'webextension-polyfill';

import createApi from '@proton/pass/api';
import { getPersistedSession, setPersistedSession } from '@proton/pass/auth';
import { backgroundMessage } from '@proton/pass/extension/message';
import { browserLocalStorage, browserSessionStorage } from '@proton/pass/extension/storage';
import { boot, wakeup } from '@proton/pass/store';
import { WorkerMessageType, WorkerState, WorkerStatus } from '@proton/pass/types';
import { getErrorMessage } from '@proton/pass/utils/errors';
import { invert, or } from '@proton/pass/utils/fp';
import { logger } from '@proton/pass/utils/logger';
import { workerBusy, workerLoggedOut, workerReady, workerStale } from '@proton/pass/utils/worker';
import sentry, { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import noop from '@proton/utils/noop';

import * as config from '../app/config';
import { ENV, RESUME_FALLBACK, createDevReloader, setPopupIcon } from '../shared/extension';
import WorkerMessageBroker from './channel';
import WorkerContext, { waitForContext } from './context';
import { createAliasService } from './services/alias';
import { createAuthService } from './services/auth';
import { createAutoFillService } from './services/autofill';
import { createAutoSaveService } from './services/autosave';
import { createCacheProxyService } from './services/cache-proxy';
import { createExportService } from './services/export';
import { createFormSubmissionTracker } from './services/form-submission.tracker';
import { createPrivacySettingsService } from './services/privacy';
import { createStoreService } from './services/store';
import store from './store';

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

const api = createApi({
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
});

const formTracker = createFormSubmissionTracker();
const settings = createPrivacySettingsService();
const autofill = createAutoFillService();
const autosave = createAutoSaveService();
const alias = createAliasService();
const auth = createAuthService({
    api,
    store,
    onAuthorized: () => {
        autofill.updateTabsBadgeCount().catch(noop);
        setSentryUID(auth.store.getUID());
    },
    onUnauthorized: () => {
        formTracker.clear();
        autofill.clearTabsBadgeCount().catch(noop);
        setSentryUID(undefined);
    },
});

createStoreService();
createExportService();
createCacheProxyService();

const context = WorkerContext.set({
    auth,
    alias,
    autofill,
    autosave,
    status: WorkerStatus.IDLE,
    getState: () => ({
        loggedIn: context.auth.store.hasSession() && workerReady(context.status),
        status: context.status,
        UID: context.auth.store.getUID(),
    }),
    setStatus: (status: WorkerStatus) => {
        logger.info(`[Worker] Status update : ${context.status} -> ${status}`);
        context.status = status;

        if (workerLoggedOut(status)) {
            setPopupIcon({ loggedIn: false }).catch(noop);
        }

        if (workerReady(status)) {
            setPopupIcon({ loggedIn: true }).catch(noop);
        }

        WorkerMessageBroker.ports.broadcast(
            backgroundMessage({
                type: WorkerMessageType.WORKER_STATUS,
                payload: { state: context.getState() },
            })
        );
    },
    init: async ({ sync, force }) => {
        const shouldInit = Boolean((sync ?? !workerReady(context.status)) || force);

        if (shouldInit && (await context.auth.init())) {
            context.boot();
        }

        return context.getState();
    },
    boot: () => {
        if (or(invert(workerBusy), workerStale)(context.status)) {
            context.setStatus(WorkerStatus.BOOTING);
            store.dispatch(boot({}));
        }
    },
});

WorkerMessageBroker.registerMessage(WorkerMessageType.RESOLVE_TAB, async (_, { tab }) => ({ tab }));
WorkerMessageBroker.registerMessage(WorkerMessageType.WORKER_INIT, async (message) =>
    context.init({ sync: message.payload.sync })
);

/**
 * - When wake-up is called from the pop-up :
 * we want to synchronously trigger the wake-up
 * saga and send the message response as soon as
 * possible as the UI will respond to state changes.
 *
 * - When wake-up is called from the content-script :
 * wait for the worker to resolve to a "ready" state
 * before sending the response
 */
WorkerMessageBroker.registerMessage(WorkerMessageType.WORKER_WAKEUP, async (message) => {
    const { status } = await context.init({});

    return Promise.resolve<WorkerState>(
        (async () => {
            switch (message.payload.origin) {
                case 'popup':
                case 'page': {
                    store.dispatch(
                        wakeup({
                            origin: message.payload.origin,
                            tabId: message.payload.tabId,
                            status,
                        })
                    );

                    return {
                        ...context.getState(),
                        buffered: WorkerMessageBroker.buffer.flush(),
                    };
                }
                case 'content-script': {
                    return (await waitForContext()).getState();
                }
                default: {
                    throw new Error('origin does not support wakeup');
                }
            }
        })()
    );
});

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
    const { loggedIn } = await context.init({ force: true });
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

        await settings.init();
    }
});
