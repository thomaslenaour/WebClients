/**
 * Creates a generic context with a simple
 * setter/getter mechanism - Useful when you
 * want to create a global singleton context object
 * while avoiding "argument-drilling"
 */
export const createSharedContext = <T>(id: string) => {
    const ref: { ctx?: T } = {};

    const set = (ctx: T) => (ref.ctx = ctx);

    const get = (): T => {
        if (ref.ctx === undefined) {
            throw new Error(`Context#${id} has not been initialized`);
        }

        return ref.ctx;
    };

    return { set, get };
};
