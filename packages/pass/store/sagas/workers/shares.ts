import { api } from '@proton/pass/api';
import { PassCrypto } from '@proton/pass/crypto';
import { Share, ShareGetResponse, ShareType, TypedOpenedShare } from '@proton/pass/types';
import { decodeVaultContent } from '@proton/pass/utils/protobuf';

import { getAllShareKeys } from './vaults';

export const getShareLatestEventId = async (shareId: string): Promise<string> =>
    (
        await api({
            url: `pass/v1/share/${shareId}/event`,
            method: 'get',
        })
    ).EventID ?? '';

const loadVaultShareById = async (shareId: string): Promise<Share<ShareType.Vault>> => {
    const [shareInfo, shareKeys, eventId] = await Promise.all([
        api({ url: `pass/v1/share/${shareId}`, method: 'get' }),
        getAllShareKeys(shareId),
        getShareLatestEventId(shareId),
    ]);

    const share = (await PassCrypto.openShare({
        encryptedShare: shareInfo.Share!,
        shareKeys,
    })) as TypedOpenedShare<ShareType.Vault>;

    const content = decodeVaultContent(share.content);

    return {
        shareId: share.shareId,
        targetId: share.targetId,
        targetType: share.targetType,
        vaultId: share.vaultId,
        eventId,
        content,
        primary: Boolean(shareInfo.Share?.Primary),
    };
};

export const requestShares = async (): Promise<ShareGetResponse[]> =>
    (
        await api({
            url: 'pass/v1/share',
            method: 'get',
        })
    ).Shares;

export const loadShare = async <T extends ShareType>(shareId: string, targetType: T): Promise<Share<T>> => {
    switch (targetType) {
        case ShareType.Vault:
            const vaultShare = await loadVaultShareById(shareId);
            return vaultShare as Share<T>;
        default:
            throw new Error(`Unsupported share type ${ShareType[targetType]}`);
    }
};
