import { fathom } from '@proton/pass/fathom/protonpass-fathom';
import { isMainFrame } from '@proton/pass/utils/dom';
import { waitUntil } from '@proton/pass/utils/fp';
import { wait } from '@proton/shared/lib/helpers/promise';
import noop from '@proton/utils/noop';

import { handleForkFallback } from './auth/fork';
import { CONTENT_SCRIPT_INJECTED } from './constants';
import { createContentScriptService } from './services/content-script';

const { isVisible } = fathom.utils;

/* notify any other injected content-script of
an incoming injection */
window.postMessage(CONTENT_SCRIPT_INJECTED, '*');

handleForkFallback(); /* handle FF fork fallback */

/**
 * Ensure the first detection runs
 * when the body is visible - on certain
 * websites JS will defer the body's initial
 * visibility (ie: europa login)
 *
 * Ensure the content-script service is created
 * on the next tick to avoid catching the post
 * message in the current content-script instance
 */
waitUntil(() => isVisible(document.body), 100)
    .then(() => wait(0)) /* ensure we go to the next tick */
    .then(() => createContentScriptService().watch(isMainFrame()))
    .catch(noop);
