import { type ReactNode, type VFC } from 'react';

import type { ItemType } from '@proton/pass/types';

import { PanelHeader } from './Header';

type Props = {
    type: ItemType;
    name?: string;
    vaultName?: string;
    actions: ReactNode[];
};

export const ItemHeader: VFC<Props> = ({ name, vaultName, actions }) => (
    <PanelHeader title={name} subtitle={vaultName} subtitleIcon="vault" actions={actions} />
);
