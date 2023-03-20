import { State } from '../types';

export const selectSessionLockToken = ({ settings }: State) => settings.sessionLockToken ?? undefined;
export const selectCanLockSession = (state: State) => selectSessionLockToken(state) !== undefined;
export const selectSessionLockSettings = ({ settings }: State) => ({
    sessionLockToken: settings.sessionLockToken,
    sessionLockTTL: settings.sessionLockTTL,
});
