const RegexURL =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export const isValidScheme = (url?: URL): url is URL =>
    url !== undefined &&
    !['chrome-extension:', 'chrome:', 'brave:'].includes(url.protocol) &&
    !url.hostname.startsWith('newtab');

/**
 * Will first try to validate against the URL constructor.
 * If it fails, try to append https:// scheme and revalidate
 * Final step is to test against a URL regex (https://urlregex.com/)
 */
export const isValidURL = (maybeUrl: string, scheme?: string): { valid: boolean; url: string } => {
    try {
        const url = `${scheme ?? ''}${maybeUrl}`;
        const urlObj = new URL(url); /* will throw a TypeError on invalid URL */

        if (!isValidScheme(urlObj)) {
            return {
                valid: false,
                url,
            };
        }

        return { valid: Boolean(RegexURL.test(url)), url: urlObj.href.replace('://www.', '://') };
    } catch (_) {
        return scheme === undefined ? isValidURL(maybeUrl, 'https://') : { valid: false, url: maybeUrl };
    }
};
