import browser from 'webextension-polyfill';

import type { Storage, StorageData } from './types';

const getItems = async <T extends StorageData>(keys: (keyof T)[]) =>
    browser.storage.local.get(keys) as Promise<Partial<T>>;

const getItem = async <T extends StorageData>(key: keyof T): Promise<T[typeof key] | null> =>
    (await getItems<T>([key]))?.[key] ?? null;

const setItems = async <T extends StorageData>(items: T): Promise<void> => browser.storage.local.set(items);

const setItem = async <T extends StorageData>(key: keyof T, value: T[typeof key]): Promise<void> =>
    setItems({ [key]: value });

const removeItems = async <T extends StorageData>(keys: (keyof T)[]): Promise<void> =>
    browser.storage.local.remove(keys as string[]);

const removeItem = async <T extends StorageData>(key: keyof T): Promise<void> => removeItems([key]);

const clear = async (): Promise<void> => browser.storage.local.clear();

const browserLocalStorage: Storage = {
    getItems,
    getItem,
    setItems,
    setItem,
    removeItems,
    removeItem,
    clear,
};

export default browserLocalStorage;
