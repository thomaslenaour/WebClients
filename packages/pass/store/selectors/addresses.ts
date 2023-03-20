import { State } from '../types';

export const selectAllAddresses = ({ addresses }: State) => (addresses ? Object.values(addresses) : undefined);

export const selectAddress =
    (addressId: string) =>
    ({ addresses }: State) =>
        addresses[addressId];
