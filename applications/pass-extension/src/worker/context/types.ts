import { type WorkerState, WorkerStatus } from '@proton/pass/types';

import { type ActivationService } from '../services/activation';
import { type AliasService } from '../services/alias';
import { type AuthService } from '../services/auth';
import { type AutoFillService } from '../services/autofill';
import { type AutoSaveService } from '../services/autosave';
import { type CacheProxyService } from '../services/cache-proxy';
import { type ExportService } from '../services/export';
import { type FormTrackerService } from '../services/form.tracker';
import { type SettingsService } from '../services/settings';
import { type StoreService } from '../services/store';

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
    /* init the worker - or force re-init using sync|force parameters */
    init: (options: WorkerInitOptions) => Promise<ServiceWorkerContext>;
    /* Returned promise will resolve when worker "ready" */
    ensureReady: () => Promise<ServiceWorkerContext>;
}
