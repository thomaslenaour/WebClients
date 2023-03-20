import { createSelector } from '@reduxjs/toolkit';

import { Maybe, Share, ShareType, VaultShare } from '@proton/pass/types';
import { isVaultShare } from '@proton/pass/utils/pass/share';

import { unwrapOptimisticState } from '../optimistic/utils/transformers';
import { State } from '../types';
import { SelectorError } from './errors';

export const selectAllShares = createSelector(
    ({ shares }: State) => shares,
    (shares) => Object.values(unwrapOptimisticState(shares))
);

export const selectAllVaults = createSelector([selectAllShares], (shares) => shares.filter(isVaultShare));

export const selectShare =
    <T extends ShareType = ShareType>(shareId: string) =>
    ({ shares }: State) =>
        shares?.[shareId] as Maybe<Share<T>>;

export const selectShareOrThrow =
    <T extends ShareType = ShareType>(shareId: string) =>
    (state: State): Share<T> => {
        const share = selectShare<T>(shareId)(state);

        if (!share) {
            throw new SelectorError(`Share ${shareId} not found`);
        }

        return share;
    };

export const selectDefaultVault = (state: State): Maybe<VaultShare> =>
    Object.values(selectAllShares(state).filter(isVaultShare))[0];

export const selectDefaultVaultOrThrow = (state: State): VaultShare => {
    const defaultVault = selectDefaultVault(state);

    if (!defaultVault) {
        throw new SelectorError(`Default vault not found`);
    }

    return defaultVault;
};
