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
    Icon,
} from '@proton/components';
import { selectAllVaults, selectShare } from '@proton/pass/store';
import type { MaybeNull, ShareType, VaultShare } from '@proton/pass/types';

import { DropdownMenuButton } from '../Dropdown/DropdownMenuButton';

type VaultOption = 'all' | 'trash' | VaultShare;

const getVaultOptionInfo = (vault: VaultOption): { id: null | string; label: string; path: string } => {
    switch (vault) {
        case 'all':
            return { id: null, label: c('Label').t`All vaults`, path: '/' };
        case 'trash':
            return { id: null, label: c('Label').t`Trash`, path: '/trash' };
        default:
            return { id: vault.vaultId, label: vault.content.name, path: `/share/${vault.shareId}` };
    }
};

type VaultItemProps = {
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

export const VaultItem = ({ label, selected, onSelect, onDelete, onEdit }: VaultItemProps) => {
    const withActions = !!(onDelete || onEdit);
    return (
        <DropdownMenuButton
            className="pl0 pr0"
            onClick={() => onSelect()}
            isSelected={selected}
            quickActions={
                withActions && (
                    <>
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
                    </>
                )
            }
        >
            <Icon name="vault" className="mr0-5" />
            <span className="text-ellipsis inline-block max-w100">{label}</span>
        </DropdownMenuButton>
    );
};

type TrashItemProps = {
    handleRestoreTrash: () => void;
    handleEmptyTrash: () => void;
    onSelect: () => void;
    selected: boolean;
};
const TrashItem: VFC<TrashItemProps> = ({ onSelect, selected, handleRestoreTrash, handleEmptyTrash }) => {
    return (
        <DropdownMenuButton
            isSelected={selected}
            onClick={onSelect}
            quickActions={
                <>
                    <DropdownMenuButton className="text-left" onClick={handleRestoreTrash}>
                        <Icon name="arrow-up-and-left" className="mr1" />
                        {c('Label').t`Restore all items`}
                    </DropdownMenuButton>
                    <DropdownMenuButton className="text-left color-danger" onClick={handleEmptyTrash}>
                        <Icon name="trash-cross" className="mr1" />
                        {c('Label').t`Empty trash`}
                    </DropdownMenuButton>
                </>
            }
        >
            <Icon name="trash" className="mr0-5" />
            {getVaultOptionInfo('trash').label}
        </DropdownMenuButton>
    );
};

export const VaultSubmenu: VFC<{
    closeMenuDropdown: () => void;
    setSearch: (query: string) => void;
    selectedVaultId: MaybeNull<string>;
    handleVaultSelectClick: (vaultId: MaybeNull<string>) => void;
    handleVaultDeleteClick: (vault: VaultShare) => void;
    handleVaultEditClick: (vault: VaultShare) => void;
    handleVaultCreateClick: () => void;
    inTrash: boolean;
    handleRestoreTrash: () => void;
    handleEmptyTrash: () => void;
}> = ({
    closeMenuDropdown,
    setSearch,
    selectedVaultId,
    handleVaultSelectClick,
    handleVaultDeleteClick,
    handleVaultEditClick,
    handleVaultCreateClick,
    inTrash,
    handleRestoreTrash,
    handleEmptyTrash,
}) => {
    const history = useHistory();
    const vaults = useSelector(selectAllVaults);
    const selectedVault = useSelector(selectShare<ShareType.Vault>(selectedVaultId ?? ''));
    const canDelete = vaults.length > 1;

    const handleSelect = (vault: VaultOption) => {
        const { id, path } = getVaultOptionInfo(vault);
        handleVaultSelectClick(id);
        closeMenuDropdown();
        setSearch('');
        history.push(path);
    };

    const selectedVaultOptionLabel = getVaultOptionInfo(selectedVault || (inTrash ? 'trash' : 'all')).label;

    return (
        <Collapsible>
            <CollapsibleHeader
                className="pr1 pl1"
                suffix={
                    <CollapsibleHeaderIconButton>
                        <Icon name="chevron-down" />
                    </CollapsibleHeaderIconButton>
                }
            >
                <span className="flex flex-align-items-center">
                    <Icon name={'vault'} className="inline mr0-25" />
                    {selectedVaultOptionLabel}
                </span>
            </CollapsibleHeader>
            <CollapsibleContent>
                <hr className="dropdown-item-hr my0-5" aria-hidden="true" />

                <VaultItem
                    label={c('Label').t`${getVaultOptionInfo('all').label}`}
                    selected={!inTrash && selectedVaultId === null}
                    onSelect={() => handleSelect('all')}
                />

                {vaults.map((vault) => (
                    <VaultItem
                        key={vault.shareId}
                        share={vault}
                        label={vault.content.name}
                        selected={!inTrash && selectedVaultId === vault.shareId}
                        onSelect={() => handleSelect(vault)}
                        onDelete={canDelete ? () => handleVaultDeleteClick(vault) : undefined}
                        onEdit={() => handleVaultEditClick(vault)}
                    />
                ))}

                <TrashItem
                    handleRestoreTrash={handleRestoreTrash}
                    handleEmptyTrash={handleEmptyTrash}
                    onSelect={() => handleSelect('trash')}
                    selected={inTrash}
                />

                <div className="pl0-5 pr0-5 mt0-5">
                    <Button className="w100" color="norm" shape="ghost" onClick={handleVaultCreateClick}>
                        {c('Action').t`Create vault`}
                    </Button>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
