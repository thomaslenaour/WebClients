import browser from 'webextension-polyfill';

import { MessageFailure, WorkerMessage, WorkerMessageWithOrigin, WorkerResponse } from '@proton/pass/types';

/**
 * Wraps the untyped browser.runtime.sendMessage
 * with our message/response types to avoid manually
 * casting the response types every time we use extension
 * messaging
 */
export const sendMessage = async <T extends WorkerMessageWithOrigin>(
    message: T
): Promise<WorkerResponse<typeof message> | MessageFailure> => {
    try {
        return (await browser.runtime.sendMessage(browser.runtime.id, message)) as WorkerResponse<typeof message>;
    } catch (error: any) {
        return { type: 'error', error };
    }
};

/**
 * Allows mapping over the response type via
 * an onReponse callback instead of manually
 * awaiting the sendMessage response and handling
 * it imperatively
 */
sendMessage.map = async <R, T extends WorkerMessageWithOrigin>(
    message: T,
    onResponse: (res: WorkerResponse<typeof message> | MessageFailure) => R
): Promise<R> => {
    try {
        return onResponse(
            (await browser.runtime.sendMessage(browser.runtime.id, message)) as WorkerResponse<typeof message>
        );
    } catch (error: any) {
        return onResponse({ type: 'error', error });
    }
};

/**
 * Allows triggering an effect with
 * the worker response
 */
sendMessage.on = async <T extends WorkerMessageWithOrigin>(
    message: T,
    onResponse: (res: WorkerResponse<typeof message> | MessageFailure) => void
): Promise<void> => {
    try {
        return onResponse(
            (await browser.runtime.sendMessage(browser.runtime.id, message)) as WorkerResponse<typeof message>
        );
    } catch (error: any) {
        return onResponse({ type: 'error', error });
    }
};

/**
 * Allows triggering an effect only if the
 * worker response is of type "success"
 */
sendMessage.onSuccess = async <T extends WorkerMessageWithOrigin>(
    message: T,
    onSuccess: (res: Exclude<WorkerResponse<typeof message>, MessageFailure>) => void
): Promise<void> =>
    sendMessage.on(message, (response) => {
        if (response.type === 'success') {
            onSuccess(response as Exclude<WorkerResponse<typeof message>, MessageFailure>);
        }
    });

/**
 * Broadcasts a single message to every tab running
 * the content-script and to the pop-up page :
 * Tabs require a dedicated sendMessage call per tab
 * to ensure multi-channel broadcasting.
 */
sendMessage.broadcast = async <T extends WorkerMessageWithOrigin>(message: T) => {
    await Promise.all([
        sendMessage(message),
        browser.tabs
            .query({ active: true })
            .then((tabs) => Promise.all(tabs.map((tab) => tab.id && browser.tabs.sendMessage(tab.id, message)))),
    ]);
};

export type MessageWithOriginFactory = <T extends WorkerMessage>(message: T) => WorkerMessageWithOrigin<T>;

export const popupMessage: MessageWithOriginFactory = (message) => ({
    ...message,
    origin: 'popup',
});

export const backgroundMessage: MessageWithOriginFactory = (message) => ({
    ...message,
    origin: 'background',
});

export const contentScriptMessage: MessageWithOriginFactory = (message) => ({
    ...message,
    origin: 'content-script',
});

export const pageMessage: MessageWithOriginFactory = (message) => ({
    ...message,
    origin: 'page',
});
