export type StorageData = Record<string, any>;

export interface Storage<Store extends StorageData = StorageData> {
    getItems: <T extends Store>(keys: (keyof T)[]) => Promise<Partial<T>>;
    setItems: <T extends Store>(items: Partial<T>) => Promise<void>;
    getItem: <T extends Store>(key: keyof T) => Promise<T[typeof key] | null>;
    setItem: <T extends Store>(key: keyof T, value: T[typeof key]) => Promise<void>;
    removeItems: <T extends Store>(keys: (keyof T)[]) => Promise<void>;
    removeItem: <T extends Store>(key: keyof T) => Promise<void>;
    clear: () => Promise<void>;
}
