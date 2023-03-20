import { fathom } from '@proton/pass/fathom/protonpass-fathom';
import { isMainFrame } from '@proton/pass/utils/dom';
import { waitUntil } from '@proton/pass/utils/fp';
import { wait } from '@proton/shared/lib/helpers/promise';
import noop from '@proton/utils/noop';

import { handleForkFallback } from './auth/fork';
import { createContentScriptService } from './services/content-script';

const { isVisible } = fathom.utils;

handleForkFallback();

/**
 * Ensure the first detection runs
 * when the body is visible - on certain
 * websites JS will defer the body's initial
 * visibility (ie: europa login)
 */
waitUntil(() => isVisible(document.body), 100)
    .then(() => wait(500))
    .then(() => createContentScriptService().watch(isMainFrame()))
    .catch(noop);
