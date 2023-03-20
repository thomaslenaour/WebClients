import uniqid from 'uniqid';
import browser from 'webextension-polyfill';

import { getCurrentTab } from '@proton/pass/extension/tabs';
import { Realm, TabId } from '@proton/pass/types';
import { createSharedContext } from '@proton/pass/utils/context';
import { logger } from '@proton/pass/utils/logger';
import { parseUrl } from '@proton/pass/utils/url';

export type ExtensionContextType = {
    tabId: TabId;
    port: browser.Runtime.Port;
    realm: Realm | null;
    subdomain: string | null;
};

export type ExtensionContextOptions = {
    origin: string;
    onDisconnect?: (previousCtx: ExtensionContextType) => void;
    onContextChange?: (nextCtx: ExtensionContextType) => void;
};

export const ExtensionContext = createSharedContext<ExtensionContextType>('extension');

export const setupExtensionContext = async (options: ExtensionContextOptions): Promise<ExtensionContextType> => {
    try {
        const tab = await getCurrentTab();
        if (tab !== undefined && tab.id !== undefined) {
            const { domain, subdomain } = parseUrl(tab.url ?? '');
            const ctx = ExtensionContext.set({
                port: browser.runtime.connect(browser.runtime.id, { name: `${options.origin}-${tab.id}-${uniqid()}` }),
                tabId: tab.id,
                realm: domain!,
                subdomain,
            });

            logger.info('[ExtensionContext] tabId resolved & port opened');

            ctx.port.onDisconnect.addListener(async () => {
                logger.info('[ExtensionContext] port disconnected - reconnecting');
                options.onDisconnect?.(ExtensionContext.get());
                options.onContextChange?.(await setupExtensionContext(options));
            });

            return ctx;
        }

        throw new Error('[ExtensionContext] Invalid runtime');
    } catch (e) {
        logger.warn(e);
        throw new Error('[ExtensionContext] Initalization failed');
    }
};
