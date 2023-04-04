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

function getItemTypeSubmitButtonLabel(type: ItemType) {
    switch (type) {
        case 'login':
            return c('Action').t`Create login`;
        case 'alias':
            return c('Action').t`Create alias`;
        case 'note':
            return c('Action').t`Create note`;
        default:
            return c('Action').t`Create`;
    }
}

export const ItemCreatePanel: FC<Props> = ({ type, formId, valid, handleCancelClick, children }) => {
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
                {getItemTypeSubmitButtonLabel(type)}
            </Button>,
        ];
    }, [type, formId, valid, handleCancelClick]);

    return (
        <Panel className={itemTypeToItemClassName[type]} header={<ItemHeader type={type} actions={actions} />}>
            {children}
        </Panel>
    );
};
