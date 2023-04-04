import { type FC, useMemo } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon } from '@proton/components';
import type { ItemType } from '@proton/pass/types';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { ItemHeader } from './ItemPanelHeader';
import { Panel } from './Panel';

type Props = {
    type: ItemType;
    formId: string;
    valid: boolean;
    handleCancelClick: () => void;
};

export const ItemEditPanel: FC<Props> = ({ type, formId, valid, handleCancelClick, children }) => {
    const actions = useMemo(() => {
        return [
            <Button
                key="cancel-button"
                icon
                pill
                shape="solid"
                color="weak"
                aria-label={c('Action').t`Cancel`}
                onClick={handleCancelClick}
            >
                <Icon name="cross" />
            </Button>,
            <Button key="submit-button" pill shape="solid" color="norm" type="submit" form={formId} disabled={!valid}>
                {c('Action').t`Save`}
            </Button>,
        ];
    }, [type, formId, valid, handleCancelClick]);

    return (
        <Panel className={itemTypeToItemClassName[type]} header={<ItemHeader type={type} actions={actions} />}>
            {children}
        </Panel>
    );
};
