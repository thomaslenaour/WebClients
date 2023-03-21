import { api } from '@proton/pass/api';
import { PassCrypto } from '@proton/pass/crypto';
import type {
    CustomAliasCreateRequest,
    ImportItemBatchRequest,
    ItemCreateIntent,
    ItemEditIntent,
    ItemImportIntent,
    ItemRevision,
    ItemRevisionContentsResponse,
    ItemType,
} from '@proton/pass/types';
import { parseOpenedItem, serializeItemContent } from '@proton/pass/utils/protobuf';
import { getEpoch } from '@proton/pass/utils/time';

/**
 * Item creation API request for all items
 * except for alias items
 */
export const createItem = async (
    createIntent: ItemCreateIntent<Exclude<ItemType, 'alias'>>
): Promise<ItemRevisionContentsResponse> => {
    const { shareId, ...item } = createIntent;

    const content = serializeItemContent(item);
    const data = await PassCrypto.createItem({ shareId, content });

    const { Item } = await api({
        url: `pass/v1/share/${shareId}/item`,
        method: 'post',
        data,
    });

    return Item!;
};

export const importItemsBatch = async (
    shareId: string,
    importIntents: ItemImportIntent[]
): Promise<ItemRevisionContentsResponse[]> => {
    const data: ImportItemBatchRequest = {
        Items: await Promise.all(
            importIntents.map(async ({ trashed, ...item }) => {
                const content = serializeItemContent(item);
                return {
                    Item: await PassCrypto.createItem({ shareId, content }),
                    AliasEmail: item.type === 'alias' ? item.extraData.aliasEmail : null,
                    Trashed: trashed,
                };
            })
        ),
    };

    const result = await api({
        url: `pass/v1/share/${shareId}/item/import/batch`,
        method: 'post',
        data,
    });

    if (result.Revisions?.RevisionsData === undefined) {
        throw new Error(`Error while batch importing data`);
    }

    return result.Revisions.RevisionsData;
};

/* Specific alias item API request */
export const createAlias = async (createIntent: ItemCreateIntent<'alias'>): Promise<ItemRevisionContentsResponse> => {
    const { shareId, ...item } = createIntent;

    const content = serializeItemContent(item);
    const encryptedItem = await PassCrypto.createItem({ shareId, content });

    const data: CustomAliasCreateRequest = {
        Item: encryptedItem,
        Prefix: item.extraData.prefix,
        SignedSuffix: item.extraData.signedSuffix,
        MailboxIDs: item.extraData.mailboxes.map(({ id }) => id),
    };

    const { Item } = await api({
        url: `pass/v1/share/${shareId}/alias/custom`,
        method: 'post',
        data,
    });

    return Item!;
};

export const editItem = async (
    editIntent: ItemEditIntent,
    lastRevision: number
): Promise<ItemRevisionContentsResponse> => {
    const { shareId, itemId, ...item } = editIntent;
    const content = serializeItemContent(item);

    const latestItemKey = (
        await api({
            url: `pass/v1/share/${shareId}/item/${itemId}/key/latest`,
            method: 'get',
        })
    ).Key!;

    const data = await PassCrypto.updateItem({ shareId, content, lastRevision, latestItemKey });

    const { Item } = await api({
        url: `pass/v1/share/${shareId}/item/${itemId}`,
        method: 'put',
        data,
    });

    return Item!;
};

export const trashItem = (item: ItemRevision) =>
    api({
        url: `pass/v1/share/${item.shareId}/item/trash`,
        method: 'post',
        data: {
            Items: [
                {
                    ItemID: item.itemId,
                    Revision: item.revision,
                },
            ],
        },
    });

export const updateItemLastUseTime = async (shareId: string, itemId: string) =>
    (
        await api({
            url: `pass/v1/share/${shareId}/item/${itemId}/lastuse`,
            method: 'put',
            data: { LastUseTime: getEpoch() },
        })
    ).Revision!;

export const parseItemRevision = async (
    shareId: string,
    encryptedItem: ItemRevisionContentsResponse
): Promise<ItemRevision> => {
    const openedItem = await PassCrypto.openItem({ shareId, encryptedItem });
    return parseOpenedItem({ openedItem, shareId });
};

const requestAllItemsForShareId = async (shareId: string): Promise<ItemRevisionContentsResponse[]> => {
    const pageIterator = async (Since?: string): Promise<ItemRevisionContentsResponse[]> => {
        const { Items } = await api({
            url: `pass/v1/share/${shareId}/item`,
            method: 'get',
            params: Since ? { Since } : {},
        });

        return Items?.LastToken
            ? Items.RevisionsData.concat(await pageIterator(Items.LastToken))
            : Items!.RevisionsData;
    };

    return pageIterator();
};

export async function requestItemsForShareId(shareId: string): Promise<ItemRevision[]> {
    const items = await requestAllItemsForShareId(shareId);
    return Promise.all(items.map((encryptedItem) => parseItemRevision(shareId, encryptedItem)));
}
