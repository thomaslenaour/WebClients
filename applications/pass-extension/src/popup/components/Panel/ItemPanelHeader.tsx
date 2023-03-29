import { type ReactNode, type VFC } from 'react';

import type { ItemType } from '@proton/pass/types';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { PanelHeader } from './Header';

type Props = {
    type: ItemType;
    name?: string;
    vaultName?: string;
    actions: ReactNode[];
};

export const ItemHeader: VFC<Props> = ({ type, name, vaultName, actions }) => (
    <PanelHeader
        className={itemTypeToItemClassName[type]}
        title={name}
        subtitle={vaultName}
        subtitleIcon="vault"
        actions={actions}
    />
);
