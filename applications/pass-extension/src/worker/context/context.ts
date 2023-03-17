import { createSharedContext } from '@proton/pass/utils/context';

import type { ServiceWorkerContext } from './types';

export const WorkerContext = createSharedContext<ServiceWorkerContext>('worker');
