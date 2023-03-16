import { ExtensionEndpoint, TabId } from '@proton/pass/types';

export const boot = () => 'boot';
export const syncing = () => 'syncing';
export const wakeup = (endpoint: ExtensionEndpoint, tabId: TabId) => `wakeup-${endpoint}-${tabId}`;

export const workerReady = (endpoint: ExtensionEndpoint, tabId: TabId) => `wakeup-${endpoint}-${tabId}`;

export const shares = () => 'shares';

export const vaultCreate = (vaultId: string) => `vault-create-request-${vaultId}`;
export const vaultEdit = (vaultId: string) => `vault-edit-request-${vaultId}`;
export const vaultDelete = (vaultId: string) => `vault-delete-request-${vaultId}`;

export const items = () => 'items';
export const importItems = () => `import-items`;

export const aliasOptions = () => `alias-options`;
export const aliasDetails = (aliasEmail: string) => `alias-details-${aliasEmail}`;

export const unlockSession = `unlock-session`;
export const settingsEdit = (setting: string) => `settings-change::${setting}`;
