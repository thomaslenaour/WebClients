export const withPayload =
    <T extends { payload: any }, F extends (payload: T['payload']) => any>(fn: F) =>
    (obj: T) =>
        fn(obj.payload);
