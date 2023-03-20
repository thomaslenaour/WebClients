/**
 * ⚠️ ⚠️ ⚠️
 * This is the only part of the extension codebase
 * still referencing the chrome.runtime API and that
 * is not yet "runtime agnostic" :
 * The storage.session API is only available in
 * chromium - still not supported for Firefox/Safari
 * extensions. Once FF has full MV3 support we can
 * safely port it to webextension-polyfill
 * ⚠️ ⚠️ ⚠️
 */
import { isFirefox } from '../browser/firefox';
import memoryStorage from './memory';
import { Storage, StorageData } from './types';

const getItems = <T extends StorageData>(keys: string[]): Promise<Partial<T>> => {
    return new Promise((resolve, reject) => {
        chrome.storage.session.get(keys, (items: any) => {
            let err = chrome.runtime.lastError;
            if (err) {
                reject(err);
            } else {
                resolve(items);
            }
        });
    });
};

export const getItem = async <T extends any>(key: string): Promise<T | null> => {
    try {
        return (await getItems([key]))?.[key];
    } catch (_) {
        return null;
    }
};

const setItems = (items: Record<string, any>): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.storage.session.set(items, () => {
            let err = chrome.runtime.lastError;
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const setItem = async (key: string, value: any): Promise<void> => {
    try {
        return await setItems({ [key]: value });
    } catch (_) {}
};

export const removeItems = async (keys: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.storage.session.remove(keys, () => {
            let err = chrome.runtime.lastError;
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const removeItem = async (key: string): Promise<void> => {
    try {
        return await removeItems([key]);
    } catch (_) {}
};

const clear = async (): Promise<void> => {
    try {
        return await chrome.storage.session.clear();
    } catch (_) {}
};

const chromeSessionStorage: Storage = {
    getItems,
    getItem,
    setItems,
    setItem,
    removeItems,
    removeItem,
    clear,
};

export default isFirefox() ? memoryStorage : chromeSessionStorage;
