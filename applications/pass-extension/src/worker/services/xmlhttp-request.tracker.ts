import browser from 'webextension-polyfill';

import { Realm, TabId } from '@proton/pass/types';
import { merge } from '@proton/pass/utils/object';
import { isFailedRequest, requestHasBodyFormData } from '@proton/pass/utils/requests';
import { parseUrl } from '@proton/pass/utils/url';

const filter: browser.WebRequest.RequestFilter = {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest'],
};

type XMLHTTPRequestTrackerOptions = {
    shouldTakeRequest: (tabId: TabId, realm: Realm) => boolean;
    onFailedRequest: (tabId: TabId, realm: Realm) => void;
};

export const createXMLHTTPRequestTracker = ({ shouldTakeRequest, onFailedRequest }: XMLHTTPRequestTrackerOptions) => {
    const pendingRequests: Map<string, browser.WebRequest.OnBeforeRequestDetailsType & { realm: Realm }> = new Map();

    const onBeforeRequest = async (request: browser.WebRequest.OnBeforeRequestDetailsType) => {
        const { tabId, requestId } = request;
        if (tabId >= 0 && requestHasBodyFormData(request)) {
            const tab = await browser.tabs.get(tabId);

            if (tab.url !== undefined) {
                const realm = parseUrl(tab.url).domain;
                if (realm) {
                    pendingRequests.set(requestId, merge(request, { realm }));
                }
            }
        }

        return {}; /* non-blocking */
    };

    const onCompleted = async (request: browser.WebRequest.OnCompletedDetailsType) => {
        const { requestId, tabId } = request;
        const pending = pendingRequests.get(requestId);

        if (pending !== undefined) {
            if (isFailedRequest(request) && shouldTakeRequest(tabId, pending.realm)) {
                onFailedRequest(tabId, pending.realm);
            }

            pendingRequests.delete(requestId);
        }
    };

    const onErrorOccured = async (request: browser.WebRequest.OnErrorOccurredDetailsType) => {
        const { requestId, tabId } = request;
        const pending = pendingRequests.get(requestId);

        if (pending !== undefined) {
            onFailedRequest(tabId, pending.realm);
            pendingRequests.delete(requestId);
        }
    };

    browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter, ['requestBody']);
    browser.webRequest.onCompleted.addListener(onCompleted, filter);
    browser.webRequest.onErrorOccurred.addListener(onErrorOccured, filter);
};
