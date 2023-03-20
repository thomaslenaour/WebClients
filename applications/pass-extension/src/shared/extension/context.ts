import uniqid from 'uniqid';
import browser from 'webextension-polyfill';

import { getCurrentTab } from '@proton/pass/extension/tabs';
import { ExtensionEndpoint, Realm, TabId } from '@proton/pass/types';
import { createSharedContext } from '@proton/pass/utils/context';
import { logger } from '@proton/pass/utils/logger';
import { parseUrl } from '@proton/pass/utils/url';

export type ExtensionContextType = {
    endpoint: ExtensionEndpoint;
    tabId: TabId;
    port: browser.Runtime.Port;
    realm: Realm | null;
    subdomain: string | null;
};

export type ExtensionContextOptions = {
    endpoint: ExtensionEndpoint;
    onDisconnect?: (previousCtx: ExtensionContextType) => void;
    onContextChange?: (nextCtx: ExtensionContextType) => void;
};

export const ExtensionContext = createSharedContext<ExtensionContextType>('extension');

export const setupExtensionContext = async (options: ExtensionContextOptions): Promise<ExtensionContextType> => {
    const { endpoint, onDisconnect, onContextChange } = options;

    try {
        const tab = await getCurrentTab();
        if (tab !== undefined && tab.id !== undefined) {
            const { domain, subdomain } = parseUrl(tab.url ?? '');
            const name = `${endpoint}-${tab.id}-${uniqid()}`;

            const ctx = ExtensionContext.set({
                endpoint,
                port: browser.runtime.connect(browser.runtime.id, { name }),
                tabId: tab.id,
                realm: domain!,
                subdomain,
            });

            logger.info('[Context::Extension] tabId resolved & port opened');

            ctx.port.onDisconnect.addListener(async () => {
                logger.info('[Context::Extension] port disconnected - reconnecting');
                onDisconnect?.(ExtensionContext.get());
                onContextChange?.(await setupExtensionContext(options));
            });

            return ctx;
        }

        throw new Error('Invalid runtime');
    } catch (e) {
        logger.warn('[Context::Extension]', e);
        throw new Error('Initalization failed');
    }
};
