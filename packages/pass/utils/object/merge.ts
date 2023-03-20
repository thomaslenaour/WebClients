import { isObject } from './is-object';

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export const merge = <Original extends { [key: PropertyKey]: any }, Overwrite extends { [key: PropertyKey]: any }>(
    original: Original,
    overwrite: Overwrite
): Original & Overwrite => {
    if ((original as any) === (overwrite as any)) {
        return original as any;
    }

    return Object.keys(overwrite).reduce(
        (overwritten, key) => ({
            ...overwritten,
            [key]: isObject(overwrite[key]) ? merge(original[key] || {}, overwrite[key]) : overwrite[key],
        }),
        original
    ) as any;
};

/**
 * Type safe merge functions that preserve
 * the original input type
 */
export const fullMerge: <T extends { [key: PropertyKey]: any }>(original: T, overwrite: T) => T = merge;
export const partialMerge: <T extends { [key: PropertyKey]: any }>(original: T, overwrite: RecursivePartial<T>) => T =
    merge;
