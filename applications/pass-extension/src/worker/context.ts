import { backgroundMessage } from '@proton/pass/extension/message';
import type { Api, WorkerState } from '@proton/pass/types';
import { WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { createSharedContext } from '@proton/pass/utils/context';
import { invert, waitUntil } from '@proton/pass/utils/fp';
import { logger } from '@proton/pass/utils/logger';
import { workerBusy, workerLoggedOut, workerReady } from '@proton/pass/utils/worker';
import { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import noop from '@proton/utils/noop';

import { setPopupIcon } from '../shared/extension';
import WorkerMessageBroker from './channel';
import { type ActivationService, createActivationService } from './services/activation';
import { type AliasService, createAliasService } from './services/alias';
import { type AuthService, createAuthService } from './services/auth';
import { type AutoFillService, createAutoFillService } from './services/autofill';
import { type AutoSaveService, createAutoSaveService } from './services/autosave';
import { type CacheProxyService, createCacheProxyService } from './services/cache-proxy';
import { type ExportService, createExportService } from './services/export';
import { type FormTrackerService, createFormTrackerService } from './services/form.tracker';
import { type SettingsService, createSettingsService } from './services/settings';
import { type StoreService, createStoreService } from './services/store';

export type WorkerInitOptions = {
    sync?: boolean /* will clear local storage */;
    force?: boolean /* will bypass busy state */;
};

export interface ServiceWorkerContext {
    status: WorkerStatus;
    service: {
        auth: AuthService;
        activation: ActivationService;
        alias: AliasService;
        autofill: AutoFillService;
        autosave: AutoSaveService;
        cacheProxy: CacheProxyService;
        export: ExportService;
        formTracker: FormTrackerService;
        settings: SettingsService;
        store: StoreService;
    };
    /* status update : side-effects will be triggered */
    setStatus: (status: WorkerStatus) => void;
    /* returns the current worker state */
    getState: () => WorkerState;
    /* Returned promise will resolve when worker "ready" */
    waitForReady: () => Promise<ServiceWorkerContext>;
    /* init the worker - or force re-init using sync|force parameters */
    init: (options: WorkerInitOptions) => Promise<ServiceWorkerContext>;
}

const WorkerContext = createSharedContext<ServiceWorkerContext>('worker');
export default WorkerContext;

export const createWorkerContext = (options: { api: Api; status: WorkerStatus }) => {
    const auth = createAuthService({
        api: options.api,
        onAuthorized: () => {
            const ctx = WorkerContext.get();
            ctx.service.activation.boot();
            ctx.service.autofill.updateTabsBadgeCount().catch(noop);
            setSentryUID(auth.authStore.getUID());
        },
        onUnauthorized: () => {
            const ctx = WorkerContext.get();
            ctx.service.autofill.clearTabsBadgeCount().catch(noop);
            ctx.service.formTracker.clear();
            setSentryUID(undefined);
        },
    });

    const context = WorkerContext.set({
        status: options.status,
        service: {
            auth,
            activation: createActivationService(),
            alias: createAliasService(),
            autofill: createAutoFillService(),
            autosave: createAutoSaveService(),
            cacheProxy: createCacheProxyService(),
            export: createExportService(),
            formTracker: createFormTrackerService(),
            settings: createSettingsService(),
            store: createStoreService(),
        },

        async waitForReady() {
            const context = WorkerContext.get();
            await waitUntil(() => invert(workerBusy)(context.getState().status), 50);

            return context;
        },

        getState: () => ({
            loggedIn: auth.authStore.hasSession() && workerReady(context.status),
            status: context.status,
            UID: auth.authStore.getUID(),
        }),

        setStatus(status: WorkerStatus) {
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

        async init({ sync, force }) {
            const shouldInit = Boolean((sync ?? !workerReady(context.status)) || force);
            const shouldBoot = shouldInit && (await auth.init());

            if (shouldBoot) {
                context.service.activation.boot();
            }

            return context;
        },
    });

    return context;
};
