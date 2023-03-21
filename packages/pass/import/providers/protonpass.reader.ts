import JSZip from 'jszip';
import { c } from 'ttag';
import uniqid from 'uniqid';

import type { ExportPayload } from '@proton/pass/export';
import { pageMessage, sendMessage } from '@proton/pass/extension/message';
import { type ItemImportIntent, ItemState, WorkerMessageType } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import { base64StringToUint8Array } from '@proton/shared/lib/helpers/encoding';

import type { ImportPayload } from '../types';

type ProtonPassReaderPayload =
    | { data: ArrayBuffer; encrypted: false }
    | { data: string; encrypted: true; passphrase: string };

export const readProtonPassData = async (payload: ProtonPassReaderPayload): Promise<ImportPayload> => {
    try {
        const zipBuffer = payload.encrypted
            ? /**
               * CryptoProxy is only initalized in the worker execution
               * context. Send a pageMessage (as of now the importer is
               * handled in the settings page) to decrypt the payload
               * before reading the .zip file contents
               */
              await (async () =>
                  sendMessage.map(
                      pageMessage({
                          type: WorkerMessageType.EXPORT_DECRYPT,
                          payload: { data: payload.data, passphrase: payload.passphrase },
                      }),
                      (res) => {
                          if (res.type === 'error') {
                              throw new Error('Could not decrypt PGP encrypted zip');
                          }

                          return base64StringToUint8Array(res.data);
                      }
                  ))()
            : payload.data;

        const zipFile = await JSZip.loadAsync(zipBuffer);
        const zipObject = zipFile.file(`${PASS_APP_NAME}/data.json`);
        const exportData = await zipObject?.async('string');

        if (exportData === undefined) {
            throw new Error('Could not resolve export data');
        }

        const { vaults } = JSON.parse(exportData) as ExportPayload;

        return Object.values(vaults).map(({ name, items }) => ({
            type: 'new',
            vaultName: name,
            id: uniqid(),
            items: items.map(
                (item) =>
                    ({
                        ...item.data,
                        ...(item.data.type === 'alias' ? { extraData: { aliasEmail: item.aliasEmail! } } : {}),
                        trashed: item.state === ItemState.Trashed,
                        createTime: item.createTime,
                        modifyTime: item.modifyTime,
                    } as ItemImportIntent)
            ),
        }));
    } catch (e) {
        logger.warn('[Importer::Proton]', e);
        throw new Error(c('Error').t`File could not be parsed`);
    }
};
