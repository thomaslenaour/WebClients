import { CryptoProxy, PrivateKeyReference } from '@proton/crypto';
import { CONTENT_FORMAT_VERSION, ShareType } from '@proton/pass/types';
import type { TypedOpenedShare } from '@proton/pass/types';
import { ADDRESS_TYPE } from '@proton/shared/lib/constants';
import type { Address, DecryptedKey } from '@proton/shared/lib/interfaces';

/**
 * Load Crypto API outside of web workers, for testing purposes.
 * Dynamic import to avoid loading the library unless required
 */
export async function setupCryptoProxyForTesting() {
    const { Api: CryptoApi } = await import('@proton/crypto/lib/worker/api');
    CryptoApi.init();

    CryptoProxy.setEndpoint(new CryptoApi(), (endpoint) => endpoint.clearKeyStore());
}

export function releaseCryptoProxy() {
    return CryptoProxy.releaseEndpoint();
}

export function randomKey(): Promise<PrivateKeyReference> {
    return CryptoProxy.generateKey({ userIDs: [{ name: 'TestKey', email: 'test@proton.ch' }], curve: 'ed25519' });
}

export const TEST_KEY_PASSWORD = 'p4ssphr4se';
export const TEST_KEY_ID = '123';

export const createRandomKey = async (): Promise<DecryptedKey> => {
    const generatedKey = await randomKey();

    return {
        privateKey: generatedKey,
        publicKey: generatedKey,
        ID: TEST_KEY_ID,
    };
};

export function randomAddress(): Address {
    return {
        DisplayName: '',
        DomainID: '',
        Email: '',
        HasKeys: 0,
        Keys: [],
        Order: 0,
        Priority: 0,
        Receive: 0,
        Send: 0,
        Signature: '',
        SignedKeyList: null,
        Status: 0,
        Type: ADDRESS_TYPE.TYPE_ORIGINAL,
        ID: '345',
    };
}

export function randomContents(length: Number = 20): Uint8Array {
    let a = [];
    for (let i = 0; i < length; i++) {
        a[i] = Math.ceil(Math.random() * 255);
    }
    return new Uint8Array(a);
}

export const createRandomShare = <T extends ShareType>(targetType: T): TypedOpenedShare<T> => {
    const base = {
        shareId: `shareId-${Math.random()}`,
        vaultId: `vaultId-${Math.random()}`,
        targetId: `targetId-${Math.random()}`,
        addressId: `addressId-${Math.random()}`,
        permission: 42,
        expireTime: 0,
        createTime: 0,
    };

    switch (targetType) {
        case ShareType.Vault: {
            return {
                ...base,
                targetType,
                content: randomContents(),
                contentKeyRotation: 1,
                contentFormatVersion: CONTENT_FORMAT_VERSION,
            } as TypedOpenedShare<T>;
        }
        case ShareType.Item: {
            return {
                ...base,
                targetType,
                content: null,
                contentKeyRotation: null,
                contentFormatVersion: null,
            } as TypedOpenedShare<T>;
        }
        default: {
            throw new Error('Unknown target share type');
        }
    }
};
