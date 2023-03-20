/* eslint-disable curly */
import { c } from 'ttag';
import uniqid from 'uniqid';

import { ItemImportIntent, Maybe } from '@proton/pass/types';
import {
    BITWARDEN_ANDROID_APP_FLAG,
    isBitwardenLinkedAndroidAppUrl,
    isValidURL,
    parseTotp,
} from '@proton/pass/utils/url';

import { ImportPayload } from '../types';
import { BitwardenData, BitwardenType } from './bitwarden.types';

export const readBitwardenData = (data: string): ImportPayload => {
    try {
        const { items, encrypted } = JSON.parse(data) as BitwardenData;

        if (encrypted) {
            const err = new Error();
            err.name = 'BitwardenEncryptedError';
            err.message = c('Error').t`Cannot parse encrypted bitwarden json`;
            throw err;
        }

        return [
            {
                type: 'new',
                vaultName: c('Title').t`Bitwarden import`,
                id: uniqid(),
                items: items
                    .filter(({ type }) => Object.values(BitwardenType).includes(type))
                    .map((item): Maybe<ItemImportIntent> => {
                        switch (item.type) {
                            case BitwardenType.LOGIN:
                                const uris = (item.login.uris ?? []).reduce<{ web: string[]; android: string[] }>(
                                    (acc, { uri }) => {
                                        if (isBitwardenLinkedAndroidAppUrl(uri)) {
                                            acc.android.push(uri.replace(BITWARDEN_ANDROID_APP_FLAG, ''));
                                            return acc;
                                        }

                                        const { valid, url } = isValidURL(uri);
                                        if (valid) acc.web.push(url);

                                        return acc;
                                    },
                                    { web: [], android: [] }
                                );

                                const loginCreationIntent: ItemImportIntent<'login'> = {
                                    type: 'login',
                                    metadata: {
                                        name: item.name,
                                        note: item.notes ?? '',
                                        itemUuid: uniqid(),
                                    },
                                    content: {
                                        username: item.login.username ?? '',
                                        password: item.login.password ?? '',
                                        urls: uris.web,
                                        totpUri: item.login.totp ? parseTotp(item.login.totp, item.name) : '',
                                    },
                                    platformSpecific: {
                                        android: {
                                            allowedApps: uris.android.map((appId) => ({
                                                packageName: appId,
                                                appName: appId,
                                                hashes: [appId],
                                            })),
                                        },
                                    },
                                    extraFields: [],
                                    trashed: false,
                                };

                                return loginCreationIntent;

                            case BitwardenType.NOTE:
                                const noteCreationIntent: ItemImportIntent<'note'> = {
                                    type: 'note',
                                    metadata: {
                                        name: item.name,
                                        note: item.notes ?? '',
                                        itemUuid: uniqid(),
                                    },
                                    content: {},
                                    extraFields: [],
                                    trashed: false,
                                };

                                return noteCreationIntent;
                            default:
                                return;
                        }
                    })
                    .filter((intent): intent is ItemImportIntent => intent !== undefined),
            },
        ];
    } catch (e) {
        if (e instanceof Error && e.name === 'BitwardenEncryptedError') {
            throw e;
        }

        throw new Error(c('Error').t`File could not be parsed`);
    }
};
