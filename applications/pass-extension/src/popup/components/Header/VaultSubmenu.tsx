import { type VFC } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleHeader,
    CollapsibleHeaderIconButton,
    DropdownMenuButton,
    Icon,
} from '@proton/components';
import { selectAllVaults, selectShare } from '@proton/pass/store';
import type { MaybeNull, ShareType, VaultShare } from '@proton/pass/types';

import { QuickActionsDropdown } from '../QuickActionsDropdown';

type VaultOptionProps = {
    share?: VaultShare;
    label: string;
    selected: boolean;
    onSelect: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

const handleClickEvent = (handler: () => void) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    handler();
};
export const VaultOption = ({ label, selected, onSelect, onDelete, onEdit }: VaultOptionProps) => {
    const withActions = !!(onDelete || onEdit);

    return (
        <div className="flex flex-align-items-center flex-nowrap">
            <DropdownMenuButton
                className="flex flex-align-items-center flex-justify-space-between text-left"
                onClick={() => onSelect()}
                isSelected={selected}
            >
                <span className="flex flex-align-items-center">
                    <Icon name="vault" className="mr0-5" />
                    <span className="text-ellipsis inline-block max-w100">{label}</span>
                </span>
            </DropdownMenuButton>
            {withActions && (
                <QuickActionsDropdown shape="ghost" color="weak" disabled={false}>
                    <DropdownMenuButton
                        className="flex flex-align-items-center text-left"
                        onClick={onEdit ? (evt) => handleClickEvent(onEdit)(evt) : undefined}
                    >
                        <Icon name="pen" className="mr0-5" />
                        {c('Action').t`Edit vault`}
                    </DropdownMenuButton>
                    <DropdownMenuButton
                        className="flex flex-align-items-center text-left"
                        disabled={!onDelete}
                        onClick={onDelete ? handleClickEvent(onDelete) : undefined}
                    >
                        <Icon name="trash" className="mr0-5" />
                        {c('Action').t`Delete vault`}
                    </DropdownMenuButton>
                </QuickActionsDropdown>
            )}
        </div>
    );
};

export const VaultSubmenu: VFC<{
    selectedVaultId: MaybeNull<string>;
    handleVaultSelectClick: (vaultId: MaybeNull<string>) => void;
    handleVaultDeleteClick: (vault: VaultShare) => void;
    handleVaultEditClick: (vault: VaultShare) => void;
    handleVaultCreateClick: () => void;
}> = ({
    selectedVaultId,
    handleVaultSelectClick,
    handleVaultDeleteClick,
    handleVaultEditClick,
    handleVaultCreateClick,
}) => {
    const history = useHistory();

    const vaults = useSelector(selectAllVaults);
    const selectedVault = useSelector(selectShare<ShareType.Vault>(selectedVaultId ?? ''));
    const canDelete = vaults.length > 1;

    return (
        <>
            <Collapsible className="pr1 pl1">
                <CollapsibleHeader
                    suffix={
                        <CollapsibleHeaderIconButton>
                            <Icon name="chevron-down" />
                        </CollapsibleHeaderIconButton>
                    }
                >
                    <span className="flex flex-align-items-center">
                        <Icon name={'vault'} className="inline mr0-25" />{' '}
                        {selectedVault?.content.name ?? c('Label').t`All vaults`}
                    </span>
                </CollapsibleHeader>
                <CollapsibleContent>
                    <VaultOption
                        label={c('Label').t`All vaults`}
                        selected={selectedVaultId === null}
                        onSelect={() => handleVaultSelectClick(null)}
                    />

                    {vaults.map((vault) => (
                        <VaultOption
                            key={vault.shareId}
                            share={vault}
                            label={vault.content.name}
                            selected={selectedVaultId === vault.shareId}
                            onSelect={() => handleVaultSelectClick(vault.shareId)}
                            onDelete={canDelete ? () => handleVaultDeleteClick(vault) : undefined}
                            onEdit={() => handleVaultEditClick(vault)}
                        />
                    ))}

                    <DropdownMenuButton className="text-left" onClick={() => history.push('/trash')}>
                        <Icon name="trash" className="mr0-5" />
                        {c('Action').t`Trash`}
                    </DropdownMenuButton>

                    <Button className="w100 mt0-5" color="weak" onClick={handleVaultCreateClick}>
                        {c('Action').t`Create vault`}
                    </Button>
                </CollapsibleContent>
            </Collapsible>
        </>
    );
};
