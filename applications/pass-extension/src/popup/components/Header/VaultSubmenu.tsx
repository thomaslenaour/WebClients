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
import { VaultColor as VaultColorEnum, VaultIcon as VaultIconEnum } from '@proton/pass/types/protobuf/vault-v1';

import { DropdownMenuButton } from '../Dropdown/DropdownMenuButton';
import { VaultIcon } from '../Vault/VaultIcon';

type VaultOption = 'all' | 'trash' | VaultShare;

const getVaultOptionInfo = (
    vault: VaultOption
): { id: null | string; label: string; path: string; color?: VaultColorEnum; icon?: VaultIconEnum } => {
    switch (vault) {
        case 'all':
            return { id: null, label: c('Label').t`All vaults`, path: '/' };
        case 'trash':
            return { id: null, label: c('Label').t`Trash`, path: '/trash' };
        default:
            return {
                id: vault.shareId,
                label: vault.content.name,
                path: `/share/${vault.shareId}`,
                color: vault.content.display.color,
                icon: vault.content.display.icon,
            };
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

export const VaultItem: VFC<VaultItemProps> = ({ share, label, selected, onSelect, onDelete, onEdit }) => {
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
                            <Icon name="pen" className="mr-2" />
                            {c('Action').t`Edit vault`}
                        </DropdownMenuButton>
                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            disabled={!onDelete}
                            onClick={onDelete ? handleClickEvent(onDelete) : undefined}
                        >
                            <Icon name="trash" className="mr-2" />
                            {c('Action').t`Delete vault`}
                        </DropdownMenuButton>
                    </>
                )
            }
        >
            <VaultIcon
                className="mr-2"
                size="small"
                color={share?.content.display.color}
                icon={share?.content.display.icon}
            />
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
            <Icon name="trash" className="mr-2" />
            {getVaultOptionInfo('trash').label}
        </DropdownMenuButton>
    );
};

export const VaultSubmenu: VFC<{
    selectedShareId: MaybeNull<string>;
    handleVaultSelectClick: (shareId: MaybeNull<string>) => void;
    handleVaultDeleteClick: (vault: VaultShare) => void;
    handleVaultEditClick: (vault: VaultShare) => void;
    handleVaultCreateClick: () => void;
    inTrash: boolean;
    handleRestoreTrash: () => void;
    handleEmptyTrash: () => void;
}> = ({
    selectedShareId,
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
    const selectedVault = useSelector(selectShare<ShareType.Vault>(selectedShareId ?? ''));
    const canDelete = vaults.length > 1;

    const handleSelect = (vault: VaultOption) => {
        const { id, path } = getVaultOptionInfo(vault);
        handleVaultSelectClick(id);
        history.push(path);
    };

    const selectedVaultOption = getVaultOptionInfo(selectedVault || (inTrash ? 'trash' : 'all'));

    return (
        <Collapsible>
            <CollapsibleHeader
                className="pr1 pl1"
                suffix={
                    <CollapsibleHeaderIconButton className="pr-0">
                        <Icon name="chevron-down" />
                    </CollapsibleHeaderIconButton>
                }
            >
                <span className="flex flex-align-items-center">
                    <VaultIcon
                        className="mr-2"
                        size="small"
                        color={selectedVaultOption?.color}
                        icon={selectedVaultOption?.icon}
                    />
                    {selectedVaultOption.label}
                </span>
            </CollapsibleHeader>
            <CollapsibleContent>
                <hr className="dropdown-item-hr my-2" aria-hidden="true" />

                <VaultItem
                    label={c('Label').t`${getVaultOptionInfo('all').label}`}
                    selected={!inTrash && selectedShareId === null}
                    onSelect={() => handleSelect('all')}
                />

                {vaults.map((vault) => (
                    <VaultItem
                        key={vault.shareId}
                        share={vault}
                        label={vault.content.name}
                        selected={!inTrash && selectedShareId === vault.shareId}
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

                <div className="px-2 mt-2">
                    <Button className="w100" color="weak" shape="solid" onClick={handleVaultCreateClick}>
                        {c('Action').t`Create vault`}
                    </Button>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
