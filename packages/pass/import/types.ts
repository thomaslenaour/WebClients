import { ItemImportIntent } from '../types';

export enum ImportProvider {
    BITWARDEN = 'Bitwarden',
    CHROME = 'Chrome',
    ONEPASSWORD = '1Password (1PUX format)',
    PROTONPASS = 'Proton Pass',
    PROTONPASS_PGP = 'Proton Pass (PGP encrypted)',
}

export type ImportReaderPayload = {
    file: File;
} & (
    | {
          provider:
              | ImportProvider.BITWARDEN
              | ImportProvider.ONEPASSWORD
              | ImportProvider.PROTONPASS
              | ImportProvider.CHROME;
      }
    | { provider: ImportProvider.PROTONPASS_PGP; passphrase: string }
);

/**
 * type: 'existing' => import items to existing vault
 * type: 'new'      => import items to new vault
 */
export type ImportVault = (
    | {
          type: 'existing';
          vaultId: string;
      }
    | { type: 'new' }
) & {
    items: ItemImportIntent[];
    vaultName: string;
    id: string;
};

export type ImportPayload = ImportVault[];
