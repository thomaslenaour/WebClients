import browser from 'webextension-polyfill';

import { Storage, StorageData } from './types';

const getItems = <T extends StorageData>(keys: string[]) => browser.storage.local.get(keys) as Promise<Partial<T>>;

const getItem = async <T extends any>(key: string): Promise<T | null> =>
    (await getItems<Record<string, T>>([key]))?.[key] ?? null;

const setItems = (items: any): Promise<void> => browser.storage.local.set(items);

const setItem = (key: string, value: any): Promise<void> => setItems({ [key]: value });

const removeItems = (keys: string[]): Promise<void> => browser.storage.local.remove(keys);

const removeItem = (key: string): Promise<void> => removeItems([key]);

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
