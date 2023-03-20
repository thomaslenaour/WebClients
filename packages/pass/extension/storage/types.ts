export type StorageData = Record<string, any>;

export interface Storage {
    getItems: <T extends StorageData>(keys: string[]) => Promise<Partial<T>>;
    setItems: (items: StorageData) => Promise<void>;
    getItem: <T extends any>(key: string) => Promise<T | null>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItems: (keys: string[]) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
}
