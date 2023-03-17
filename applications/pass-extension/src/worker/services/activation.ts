import browser, { type Runtime } from 'webextension-polyfill';

import { getPersistedSession } from '@proton/pass/auth';
import { browserLocalStorage, browserSessionStorage } from '@proton/pass/extension/storage';
import { boot, wakeup } from '@proton/pass/store/actions';
import {
    WorkerInitMessage,
    WorkerMessageResponse,
    WorkerMessageType,
    WorkerMessageWithSender,
    WorkerStatus,
    WorkerWakeUpMessage,
} from '@proton/pass/types';
import { getErrorMessage } from '@proton/pass/utils/errors';
import { logger } from '@proton/pass/utils/logger';
import { workerCanBoot } from '@proton/pass/utils/worker';

import { ENV, RESUME_FALLBACK } from '../../shared/extension';
import WorkerMessageBroker from '../channel';
import { withContext } from '../context';
import store from '../store';

export const createActivationService = () => {
    /**
     * Safety-net around worker boot-sequence :
     * Ensures no on-going boot.
     */
    const handleBoot = withContext((ctx) => {
        if (workerCanBoot(ctx.status)) {
            ctx.setStatus(WorkerStatus.BOOTING);
            store.dispatch(boot({}));
        }
    });
    /**
     * Try recovering the session when browser starts up
     * if any session was locally persisted
     * if not in production - use sync.html session to workaround the
     * the SSL handshake (net:ERR_SSL_CLIENT_AUTH_CERT_NEEDED)
     */
    const handleStartup = withContext(async (ctx) => {
        const { loggedIn } = (await ctx.init({ force: true })).getState();

        if (ENV === 'development' && RESUME_FALLBACK) {
            if (!loggedIn && (await getPersistedSession())) {
                const url = browser.runtime.getURL('/onboarding.html#/resume');
                return browser.windows.create({ url, type: 'popup', height: 600, width: 540 });
            }
        }
    });

    /**
     * On extension update :
     * - Re-init so as to resume session as soon as possible
     * - In production : clear the state/snapshot cache in
     * order to gracefully handle any possible store structure
     * changes
     */
    const handleInstall = withContext(async (ctx, details: Runtime.OnInstalledDetailsType) => {
        if (details.reason === 'update') {
            if (ENV === 'production') {
                await browserLocalStorage.removeItems(['state', 'snapshot']);
            }

            return ctx.init({ force: true });
        }

        if (details.reason === 'install') {
            try {
                await Promise.all([browserLocalStorage.clear(), browserSessionStorage.clear()]);
                const url = browser.runtime.getURL('/onboarding.html#/success');
                await browser.tabs.create({ url });
            } catch (error: any) {
                logger.warn(`[Worker] requesting fork failed: ${getErrorMessage(error)}`);
            }

            await ctx.service.settings.init();
        }
    });

    /**
     * When waking up from the pop-up (or page) we need to trigger the background wakeup
     * saga while immediately resolving the worker state so the UI can respond to state
     * changes as soon as possible. Regarding the content-script, we simply wait for a
     * ready state as its less "critical".
     */
    const handleWakeup = withContext(async (ctx, message: WorkerMessageWithSender<WorkerWakeUpMessage>) => {
        const { status } = await ctx.init({});

        return new Promise<WorkerMessageResponse<WorkerMessageType.WORKER_WAKEUP>>(async (resolve) => {
            const { sender: endpoint, payload } = message;
            const { tabId } = payload;

            switch (message.sender) {
                case 'popup':
                case 'page': {
                    /* dispatch a wakeup action for this specific receiver.
                    tracking the wakeup's request metadata can be consumed
                    in the UI to infer wakeup result - see `wakeup.saga.ts` */
                    store.dispatch(wakeup({ endpoint, tabId, status }));

                    resolve({
                        ...ctx.getState(),
                        buffered: WorkerMessageBroker.buffer.flush(),
                    });
                }
                case 'content-script': {
                    /* no need for any redux operations on content-script
                    wakeup as it doesn't hold any store. */
                    return resolve((await ctx.ensureReady()).getState());
                }
            }
        });
    });

    const handleInit = withContext(async (ctx, message: WorkerMessageWithSender<WorkerInitMessage>) =>
        (await ctx.init({ sync: message.payload.sync })).getState()
    );

    WorkerMessageBroker.registerMessage(WorkerMessageType.WORKER_WAKEUP, handleWakeup);
    WorkerMessageBroker.registerMessage(WorkerMessageType.WORKER_INIT, handleInit);
    WorkerMessageBroker.registerMessage(WorkerMessageType.RESOLVE_TAB, (_, { tab }) => ({ tab }));

    return {
        boot: handleBoot,
        onInstall: handleInstall,
        onStartup: handleStartup,
    };
};

export type ActivationService = ReturnType<typeof createActivationService>;
