import { useEffect } from 'react';

import browser from 'webextension-polyfill';

export const useTabsQuery = (
    query: browser.Tabs.QueryQueryInfoType,
    onTabsResult: (url: browser.Tabs.Tab[]) => void
) => {
    useEffect(() => {
        browser.tabs.query(query).then(onTabsResult).catch(console.warn);
    }, []);
};
