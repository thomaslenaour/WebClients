import { AliasMailbox } from '@proton/pass/types/data/alias';

import { AliasState } from '../reducers';
import { State } from '../types';

export const selectAliasOptions = ({ alias }: State): AliasState['aliasOptions'] | null => alias.aliasOptions;

export const selectMailboxesForAlias =
    (aliasEmail: string) =>
    ({ alias }: State): AliasMailbox[] | undefined =>
        alias.aliasDetails?.[aliasEmail] ?? undefined;
