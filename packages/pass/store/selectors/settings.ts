import { State } from '../types';

export const selectSessionLockToken = ({ settings }: State) => settings.sessionLockToken ?? undefined;
