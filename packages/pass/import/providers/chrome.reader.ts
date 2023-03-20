import { c } from 'ttag';
import uniqid from 'uniqid';

import type { ItemImportIntent } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { isValidURL } from '@proton/pass/utils/url';

import { readCSV } from '../helpers/csv.reader';
import type { ImportPayload } from '../types';
import type { ChromeItem } from './chrome.types';

export const readChromeData = async (data: string): Promise<ImportPayload> => {
    try {
        const items = await readCSV<ChromeItem>(data, ['name', 'url', 'username', 'password']);

        return [
            {
                type: 'new',
                vaultName: c('Title').t`Bitwarden import`,
                id: uniqid(),
                items: items.map((item): ItemImportIntent<'login'> => {
                    const validUrl = item.url ? isValidURL(item.url)?.valid : false;
                    const urls = validUrl ? [new URL(item.url!).origin] : [];

                    return {
                        type: 'login',
                        metadata: {
                            name: item.name ?? item.username ?? 'Unnamed chrome-saved item',
                            note: '',
                            itemUuid: uniqid(),
                        },
                        content: {
                            username: item.username ?? '',
                            password: item.password ?? '',
                            urls,
                            totpUri: '',
                        },
                        platformSpecific: {
                            android: { allowedApps: [] },
                        },
                        extraFields: [],
                        trashed: false,
                    };
                }),
            },
        ];
    } catch (e) {
        logger.warn(e);
        throw new Error(e instanceof Error ? e.message : c('Error').t`File could not be parsed`);
    }
};
