export const isTotpUri = (maybeUri: string): boolean => maybeUri.startsWith('otpauth://');

export const toTotpUri = (secret: string, identifier: string): string =>
    `otpauth://totp/${encodeURIComponent(identifier)}?secret=${secret}`;

export const parseTotp = (totpUriOrSecret: string, identifier: string): string =>
    isTotpUri(totpUriOrSecret) ? totpUriOrSecret : toTotpUri(totpUriOrSecret, identifier);
