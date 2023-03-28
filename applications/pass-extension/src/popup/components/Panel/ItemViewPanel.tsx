import { type FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { DropdownMenuButton, Icon } from '@proton/components';
import { selectAllVaults } from '@proton/pass/store';
import type { ItemType } from '@proton/pass/types';

import { QuickActionsDropdown } from '../../components/Dropdown/QuickActionsDropdown';
import { ItemHeader } from './ItemPanelHeader';
import { Panel } from './Panel';

type Props = {
    type: ItemType;
    name: string;
    vaultName: string;

    optimistic: boolean;
    failed: boolean;
    trashed: boolean;

    handleEditClick: () => void;
    handleRetryClick: () => void;
    handleDismissClick: () => void;
    handleMoveToTrashClick: () => void;
    handleRestoreClick: () => void;
    handleDeleteClick: () => void;
};

export const ItemViewPanel: FC<Props> = ({
    type,
    name,
    vaultName,

    optimistic,
    failed,
    trashed,

    handleEditClick,
    handleRetryClick,
    handleDismissClick,
    handleMoveToTrashClick,
    handleRestoreClick,
    handleDeleteClick,

    children,
}) => {
    const vaults = useSelector(selectAllVaults);
    const showVaultSubtitle = vaults.length > 1;

    const actions = useMemo(() => {
        if (failed) {
            return [
                <Button
                    key="dismiss-item-button"
                    pill
                    className="mr-1"
                    color="danger"
                    shape="outline"
                    onClick={handleDismissClick}
                >
                    {c('Action').t`Dismiss`}
                </Button>,
                <Button key="retry-item-button" pill color="norm" onClick={handleRetryClick}>
                    {c('Action').t`Retry`}
                </Button>,
            ];
        }

        if (trashed) {
            return [
                <QuickActionsDropdown
                    key="item-quick-actions-dropdown"
                    color="weak"
                    disabled={optimistic}
                    shape="outline"
                >
                    <DropdownMenuButton className="flex flex-align-items-center text-left" onClick={handleRestoreClick}>
                        <Icon name="arrows-rotate" className="mr0-5" />
                        {c('Action').t`Restore item`}
                    </DropdownMenuButton>
                    <DropdownMenuButton className="flex flex-align-items-center text-left" onClick={handleDeleteClick}>
                        <Icon name="trash-cross" className="mr0-5" />
                        {c('Action').t`Delete permanently`}
                    </DropdownMenuButton>
                </QuickActionsDropdown>,
            ];
        }

        return [
            <Button
                key="edit-item-button"
                pill
                shape="solid"
                color="norm"
                className="mr-1"
                onClick={handleEditClick}
                disabled={optimistic}
            >
                {c('Action').t`Edit`}
            </Button>,
            <QuickActionsDropdown key="item-quick-actions-dropdown" color="norm" disabled={optimistic} shape="ghost">
                <DropdownMenuButton className="flex flex-align-items-center text-left" onClick={handleMoveToTrashClick}>
                    <Icon name="trash" className="mr0-5" />
                    {c('Action').t`Move to Trash`}
                </DropdownMenuButton>
            </QuickActionsDropdown>,
        ];
    }, [failed, optimistic, handleEditClick, handleDismissClick, handleRetryClick]);

    return (
        <Panel
            header={
                <ItemHeader
                    type={type}
                    name={name}
                    actions={actions}
                    vaultName={showVaultSubtitle ? vaultName : undefined}
                />
            }
        >
            {children}
        </Panel>
    );
};
