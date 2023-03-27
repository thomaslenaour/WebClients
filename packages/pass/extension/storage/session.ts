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
import { detectBrowser } from '../browser';
import { createMemoryStorage } from './memory';
import type { Storage, StorageData } from './types';

const getItems = <T extends StorageData>(keys: (keyof T)[]): Promise<Partial<T>> => {
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

export const getItem = async <T extends StorageData>(key: keyof T): Promise<T[typeof key] | null> => {
    try {
        return (await getItems<T>([key]))?.[key] ?? null;
    } catch (_) {
        return null;
    }
};

const setItems = <T extends StorageData>(items: Partial<T>): Promise<void> => {
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

export const setItem = async <T extends StorageData>(key: keyof T, value: T[typeof key]): Promise<void> => {
    try {
        return await setItems({ [key]: value });
    } catch (_) {}
};

export const removeItems = async <T extends StorageData>(keys: (keyof T)[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.storage.session.remove(keys as string[], () => {
            let err = chrome.runtime.lastError;
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const removeItem = async <T extends StorageData>(key: keyof T): Promise<void> => {
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

export default detectBrowser() === 'firefox' ? createMemoryStorage() : chromeSessionStorage;
