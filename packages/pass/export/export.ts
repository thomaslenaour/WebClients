import JSZip from 'jszip';

import { CryptoProxy } from '@proton/crypto';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import { uint8ArrayToBase64String } from '@proton/shared/lib/helpers/encoding';

import { ItemRevision, ItemType, VaultShareContent } from '../types';

export type ExportedItem<T extends ItemType = ItemType> = Omit<
    ItemRevision<T>,
    'revision' | 'revisionTime' | 'lastUseTime'
>;

export type ExportPayload = {
    version: string;
    encrypted: boolean;
    vaults: {
        [shareId: string]: VaultShareContent & {
            items: ExportedItem[];
        };
    };
};

/**
 * Exporting data from the extension uses the .zip format
 * for future-proofing : we will support integrating additional
 * files when exporting
 */
export const createExportZip = async (payload: ExportPayload): Promise<Uint8Array> => {
    const zip = new JSZip();
    zip.file(`${PASS_APP_NAME}/data.json`, JSON.stringify(payload));

    return zip.generateAsync({ type: 'uint8array' });
};

/**
 * Once support for argon2 is released, then we should pass a config to use
 * that instead - as long as the export feature is alpha, it’s okay to release
 * without argon2, but let’s pass config: { s2kIterationCountByte: 255 } to
 * encryptMessage with the highest security we have atm
 */
export const encryptZip = async (data: Uint8Array, passphrase: string): Promise<string> =>
    (
        await CryptoProxy.encryptMessage({
            binaryData: data,
            passwords: [passphrase],
            config: { s2kIterationCountByte: 255 },
            format: 'armored',
        })
    ).message;

export const decryptZip = async (data: string, passphrase: string): Promise<string> => {
    const decrypted = await CryptoProxy.decryptMessage({
        armoredMessage: data,
        passwords: [passphrase],
        format: 'binary',
    });

    return uint8ArrayToBase64String(decrypted.data);
};
