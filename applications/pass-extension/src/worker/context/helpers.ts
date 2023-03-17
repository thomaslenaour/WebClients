import { Callback } from '@proton/pass/types';
import { createSharedContextInjector } from '@proton/pass/utils/context';
import noop from '@proton/utils/noop';

import { WorkerContext } from './context';

export const withContext = createSharedContextInjector(WorkerContext);

export const onContextReady = <F extends Callback, P extends Parameters<F>, R extends ReturnType<F>>(
    fn: (...args: P) => R
) =>
    withContext((ctx, ...args) =>
        ctx
            .ensureReady()
            .then(() => fn(...args))
            .catch(noop)
    ) as (...args: P) => Promise<Awaited<R>>;
