import { type VFC, memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';
import browser from 'webextension-polyfill';

import { Button } from '@proton/atoms';
import {
    Dropdown,
    DropdownMenu,
    DropdownMenuButton,
    DropdownProps,
    DropdownSizeUnit,
    Icon,
    usePopperAnchor,
} from '@proton/components';
import { selectCanLockSession, vaultDeleteIntent } from '@proton/pass/store';
import type { MaybeNull, VaultShare } from '@proton/pass/types';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { ConfirmationModal } from '../../../../src/shared/components/confirmation';
import { VaultModal, VaultModalProps } from '../../../../src/shared/components/vaults/VaultModal';
import { usePopupContext } from '../../context';
import { handleVaultDeletionEffects } from '../../context/items/ItemEffects';
import { useItemsFilteringContext } from '../../context/items/useItemsFilteringContext';
import { VaultSubmenu } from './VaultSubmenu';

const DROPDOWN_SIZE: NonNullable<DropdownProps['size']> = {
    width: `20em`,
    height: DropdownSizeUnit.Dynamic,
    maxHeight: '380px',
};

const MenuDropdownRaw: VFC<{ className: string }> = ({ className }) => {
    const { sync, lock, logout, ready } = usePopupContext();
    const { vaultId, vaultBeingDeleted, setVaultId, setVaultBeingDeleted } = useItemsFilteringContext();
    const canLock = useSelector(selectCanLockSession);

    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLButtonElement>();
    const dispatch = useDispatch();

    const [deleteVault, setDeleteVault] = useState<MaybeNull<VaultShare>>(null);
    const [vaultModalProps, setVaultModalProps] = useState<MaybeNull<VaultModalProps>>(null);

    const handleVaultDelete = () => {
        if (deleteVault !== null) {
            handleVaultDeletionEffects(deleteVault.shareId, {
                vaultId,
                vaultBeingDeleted,
                setVaultBeingDeleted,
                setVaultId,
            });

            dispatch(vaultDeleteIntent({ id: deleteVault.shareId, content: deleteVault.content }));
        }
    };

    const openSettings = async (page?: string) => {
        const settingsUrl = browser.runtime.getURL('/settings.html');
        const url = `${settingsUrl}#/${page ?? ''}`;
        const match = await browser.tabs.query({ url: settingsUrl });

        await (match.length > 0
            ? browser.tabs.update(match[0].id, { highlighted: true, url })
            : browser.tabs.create({ url }));

        window.close();
    };

    return (
        <>
            <nav className={className}>
                <Button icon shape="ghost" color="norm" pill ref={anchorRef} onClick={toggle}>
                    <Icon name="hamburger" />
                </Button>

                <Dropdown
                    anchorRef={anchorRef}
                    isOpen={isOpen}
                    onClose={close}
                    originalPlacement="bottom"
                    autoClose={false}
                    size={DROPDOWN_SIZE}
                >
                    <DropdownMenu>
                        <VaultSubmenu
                            selectedVaultId={vaultId}
                            handleVaultSelectClick={setVaultId}
                            handleVaultDeleteClick={setDeleteVault}
                            handleVaultEditClick={(vault: VaultShare) =>
                                setVaultModalProps({ open: true, payload: { type: 'edit', vault } })
                            }
                            handleVaultCreateClick={() => setVaultModalProps({ open: true, payload: { type: 'new' } })}
                        />

                        <hr className="dropdown-item-hr my0-5" aria-hidden="true" />

                        <DropdownMenuButton
                            className="text-left flex flex-align-items-center flex-justify-space-between"
                            onClick={() => openSettings()}
                        >
                            <span className="flex flex-align-items-center">
                                <Icon name="cog-wheel" className="mr0-5" />
                                {c('Label').t`Settings`}
                            </span>

                            <Icon name="arrow-out-square" className="ml0-5" />
                        </DropdownMenuButton>

                        <hr className="dropdown-item-hr my0-5" aria-hidden="true" />

                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            onClick={() => window.open('mailto:pass@proton.me', '_blank')}
                        >
                            <Icon name="bug" className="mr0-5" />
                            {c('Action').t`Report a problem`}
                        </DropdownMenuButton>

                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            onClick={sync}
                            disabled={!ready}
                        >
                            <Icon name="arrow-rotate-right" className="mr0-5" />
                            {c('Action').t`Sync`}
                        </DropdownMenuButton>

                        {canLock && (
                            <DropdownMenuButton
                                className="flex flex-align-items-center text-left"
                                onClick={lock}
                                disabled={!ready}
                            >
                                <Icon name="lock" className="mr0-5" />
                                {c('Action').t`Lock ${PASS_APP_NAME}`}
                            </DropdownMenuButton>
                        )}

                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            onClick={() => logout({ soft: false })}
                        >
                            <Icon name="arrow-out-from-rectangle" className="mr0-5" />
                            {c('Action').t`Sign out`}
                        </DropdownMenuButton>
                    </DropdownMenu>
                </Dropdown>
            </nav>

            {vaultModalProps !== null && <VaultModal {...vaultModalProps} onClose={() => setVaultModalProps(null)} />}
            <ConfirmationModal
                title={c('Title').t`Delete vault ?`}
                open={deleteVault !== null}
                onClose={() => setDeleteVault(null)}
                onSubmit={handleVaultDelete}
                submitText={c('Action').t`Delete`}
            >
                {c('Warning')
                    .t`Vault "${deleteVault?.content.name}" and all its items will be permanently deleted. You can not undo this action`}
            </ConfirmationModal>
        </>
    );
};

export const MenuDropdown = memo(MenuDropdownRaw);
