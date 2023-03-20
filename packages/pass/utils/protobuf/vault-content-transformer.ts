import { ShareContent, ShareType, Vault } from '@proton/pass/types';

export const encodeVaultContent = (content: ShareContent<ShareType.Vault>): Uint8Array => {
    const creation = Vault.create({
        name: content.name,
        description: content.description,
    });

    return Vault.toBinary(creation);
};

export const decodeVaultContent = (content: Uint8Array): ShareContent<ShareType.Vault> => {
    const decoded = Vault.fromBinary(content);

    return {
        name: decoded.name,
        description: decoded.description,
    };
};
