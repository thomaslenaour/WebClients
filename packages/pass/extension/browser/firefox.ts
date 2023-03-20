export const isFirefox = (): boolean => {
    const self = globalThis as any;

    return (
        typeof self.browser !== 'undefined' &&
        Object.getPrototypeOf(self.browser) === Object.prototype &&
        self.browser.runtime
    );
};
