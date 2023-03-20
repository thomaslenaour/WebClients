/**
 * As we do not have access to the session storage API
 * in Firefox add-ons : we'll use a memory storage "mock"
 * relying on a global "store" initialized in the background
 * page. This memory storage will behave differently based on
 * the extension context. In the background page : it will
 * mimic the storage API by directly accessing a "storage" context
 * variable while maintaining the same method signatures (get/
 * set/remove/clear). In any other context (popup, content-scripts
 * etc..) we will rely on the runtime's bi-directional messaging
 * capabilities in order to access or mutate the "storage" context
 * which only lives in the background page context.
 * This gives us the benefit of not having to modify existing code
 * to handle Firefox specifics when dealing with the session API.
 */
import browser from 'webextension-polyfill';

import noop from '@proton/utils/noop';

import { Storage, StorageData } from './types';

const MEMORY_STORAGE_EVENT = 'MEMORY_STORAGE_EVENT';

type StorageAction = { type: typeof MEMORY_STORAGE_EVENT } & (
    | { action: 'get' }
    | { action: 'set'; items: Record<string, any> }
    | { action: 'remove'; items: string[] }
    | { action: 'clear' }
);

const isBackground = async (): Promise<boolean> => {
    try {
        return (await browser.runtime.getBackgroundPage()) === window;
    } catch (_) {
        return false;
    }
};

const isStorageAction = (message: any): message is StorageAction => message.type === MEMORY_STORAGE_EVENT;

const createMemoryStorage = (): Storage => {
    const context: { store: StorageData } = { store: {} };

    const applyStorageAction = async <T extends Omit<StorageAction, 'type'>>(
        action: T
    ): Promise<T['action'] extends 'get' ? StorageData : void> =>
        browser.runtime.sendMessage(browser.runtime.id, { type: MEMORY_STORAGE_EVENT, ...action });

    const resolveStorage = async (): Promise<StorageData> =>
        (await isBackground()) ? context.store : applyStorageAction({ action: 'get' });

    const getItems = async <T extends StorageData>(keys: string[]): Promise<Partial<T>> => {
        const store = await resolveStorage();
        return keys.reduce(
            (result, key) => ({
                ...result,
                ...(store?.[key] !== undefined ? { [key]: store?.[key] } : {}),
            }),
            {}
        );
    };

    const getItem = async <T extends any>(key: string): Promise<T | null> => {
        const store = await resolveStorage();
        return Promise.resolve(store?.[key] ?? null);
    };

    const setItems = async (items: Record<string, any>): Promise<void> => {
        if (!(await isBackground())) {
            return applyStorageAction({ action: 'set', items });
        }

        context.store = { ...context.store, ...items };
    };

    const setItem = async (key: string, value: any): Promise<void> => setItems({ [key]: value });

    const removeItems = async (items: string[]): Promise<void> => {
        if (!(await isBackground())) {
            return applyStorageAction({ action: 'remove', items });
        }

        items.forEach((key) => delete context.store[key]);
    };

    const removeItem = async (key: string): Promise<void> => removeItems([key]);

    const clear = async (): Promise<void> => {
        if (!(await isBackground())) {
            return applyStorageAction({ action: 'clear' });
        }

        context.store = {};
    };

    /**
     * setup context forwarding via
     * extension messaging if in background
     */
    isBackground()
        .then((inBackgroundPage) => {
            if (inBackgroundPage) {
                browser.runtime.onMessage.addListener((message): any => {
                    if (isStorageAction(message)) {
                        switch (message.action) {
                            case 'get':
                                return Promise.resolve(context.store);
                            case 'set':
                                return setItems(message.items);
                            case 'remove':
                                return removeItems(message.items);
                            case 'clear':
                                return clear();
                        }
                    }

                    return false;
                });
            }
        })
        .catch(noop);

    return {
        getItems,
        getItem,
        setItems,
        setItem,
        removeItems,
        removeItem,
        clear,
    };
};

export default createMemoryStorage();
