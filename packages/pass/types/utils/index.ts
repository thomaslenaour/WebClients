export type Callback<T extends any[] = any[]> = (...args: T) => any;

export type Maybe<T> = T | undefined;
export type MaybeNull<T> = T | null;
export type Unpack<T> = T extends (infer U)[] ? U : never;
export type MaybeArray<T> = T | T[];

export type DefinedPropertiesOnly<S extends {}> = Pick<S, DefinedKeys<S>>;
export type DefinedKeys<S extends {}, K = keyof S> = Extract<
    K,
    K extends keyof S ? (S[K] extends undefined ? never : K) : never
>;

export type ColorRGB = `${number}, ${number}, ${number}`;
