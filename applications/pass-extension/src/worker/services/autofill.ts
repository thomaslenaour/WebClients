import browser from 'webextension-polyfill';

import { itemAutofillIntent, selectAutofillCandidates, selectItemByShareIdAndId } from '@proton/pass/store';
import type { Maybe, Realm, SafeLoginItem } from '@proton/pass/types';
import { WorkerMessageType } from '@proton/pass/types';
import { parseSender, parseUrl } from '@proton/pass/utils/url';

import { setPopupIconBadge } from '../../shared/extension';
import WorkerMessageBroker from '../channel';
import WorkerContext from '../context';
import store from '../store';

export const createAutoFillService = () => {
    /**
     * - When matching a _domain_ : return all items that match
     *   the domain realm, including subdomain matches.
     * - When matching a _subdomain_ : Match all items for the
     *   top-level domain (realm). If there are items matching
     *   the subdomain then only return those. If no items match
     *   the subdomain then return every realm match
     */
    const getAutofillCandidates = (options: { realm: Realm; subdomain: string | null }): SafeLoginItem[] => {
        const { realm, subdomain } = options;
        const state = store.getState();

        const realmMatches = selectAutofillCandidates(state, realm);
        const subdomainMatches = selectAutofillCandidates(state, subdomain ?? undefined);

        const items = [
            ...subdomainMatches,
            ...realmMatches
                .map((item) => {
                    const urls = item.data.content.urls.map((url) => parseUrl(url));
                    const realmMatch = urls.some((url) => url.isTopLevelDomain && url.domain === realm);
                    return { item, priority: realmMatch ? 0 : 1 };
                })
                .sort((a, b) => a.priority - b.priority)
                .map(({ item }) => item)
                .filter(({ itemId }) => !subdomainMatches.some((item) => item.itemId === itemId)),
        ];

        return items.map((item) => ({
            name: item.data.metadata.name,
            username: item.data.content.username,
            itemId: item.itemId,
            shareId: item.shareId,
        }));
    };

    const getAutofillData = ({
        shareId,
        itemId,
    }: {
        shareId: string;
        itemId: string;
    }): Maybe<{ username: string; password: string }> => {
        const state = store.getState();
        const item = selectItemByShareIdAndId(shareId, itemId)(state);

        if (item !== undefined && item.data.type === 'login') {
            store.dispatch(itemAutofillIntent({ shareId, itemId }));
            return {
                username: item.data.content.username,
                password: item.data.content.password,
            };
        }
    };

    const updateTabsBadgeCount = async () => {
        try {
            const tabs = await browser.tabs.query({});
            await Promise.all(
                tabs.map(({ id: tabId, url, active }) => {
                    const { domain: realm, subdomain } = parseUrl(url ?? '');
                    if (tabId && realm) {
                        const items = getAutofillCandidates({ realm, subdomain });
                        const count = items.length;

                        if (active) {
                            WorkerMessageBroker.ports.broadcast(
                                {
                                    type: WorkerMessageType.AUTOFILL_SYNC,
                                    payload: { count },
                                },
                                (name) => name.startsWith(`content-script-${tabId}`)
                            );
                        }

                        return setPopupIconBadge(tabId, count);
                    }
                })
            );
        } catch (_) {}
    };

    /**
     * Clears badge count for each valid tab
     * Triggered on logout detection to avoid
     * showing stale counts
     */
    const clearTabsBadgeCount = async (): Promise<void> => {
        try {
            const tabs = await browser.tabs.query({});
            await Promise.all(tabs.map(({ id: tabId }) => tabId && setPopupIconBadge(tabId, 0)));
        } catch (_) {}
    };

    WorkerMessageBroker.registerMessage(WorkerMessageType.AUTOFILL_QUERY, async (_, sender) => {
        await WorkerContext.get().waitForReady();

        const { realm, tabId, subdomain } = parseSender(sender);
        const items = getAutofillCandidates({ realm, subdomain });

        return { items: tabId !== undefined && items.length > 0 ? items : [] };
    });

    WorkerMessageBroker.registerMessage(WorkerMessageType.AUTOFILL_SELECT, async (message) => {
        await WorkerContext.get().waitForReady();

        const credentials = getAutofillData(message.payload);
        if (credentials === undefined) {
            throw new Error('Could not get credentials for autofill request');
        }

        return credentials;
    });

    /**
     * onUpdated will be triggered every time a tab
     * has been loaded with a new url : update the
     * badge count accordingly
     */
    browser.tabs.onUpdated.addListener(async (tabId, _, tab) => {
        /**
         * ensure context is ready so autofill
         * candidates can be resolved
         */
        await WorkerContext.get().waitForReady();
        const { domain: realm, subdomain } = parseUrl(tab.url ?? '');

        if (tabId && realm) {
            const items = getAutofillCandidates({ realm, subdomain });
            return setPopupIconBadge(tabId, items.length);
        }
    });

    return { getAutofillCandidates, updateTabsBadgeCount, clearTabsBadgeCount };
};

export type AutoFillService = ReturnType<typeof createAutoFillService>;
