import { type VFC, memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

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
import { detectBrowser, getWebStoreUrl } from '@proton/pass/extension/browser';
import browser from '@proton/pass/globals/browser';
import { emptyTrashIntent, restoreTrashIntent, selectCanLockSession, vaultDeleteIntent } from '@proton/pass/store';
import type { MaybeNull, VaultShare } from '@proton/pass/types';
import { pipe, tap } from '@proton/pass/utils/fp';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { ConfirmationModal } from '../../../../src/shared/components/confirmation';
import { usePopupContext } from '../../context';
import { handleVaultDeletionEffects } from '../../context/items/ItemEffects';
import { useItemsFilteringContext } from '../../context/items/useItemsFilteringContext';
import { useNavigationContext } from '../../context/navigation/useNavigationContext';
import { VaultModal, type Props as VaultModalProps } from '../../views/Vault/Vault.modal';
import { VaultSubmenu } from './VaultSubmenu';

const DROPDOWN_SIZE: NonNullable<DropdownProps['size']> = {
    width: `20em`,
    height: DropdownSizeUnit.Dynamic,
    maxHeight: '380px',
};

const MenuDropdownRaw: VFC<{ className?: string }> = ({ className }) => {
    const { sync, lock, logout, ready } = usePopupContext();
    const { shareId, setSearch, setShareId, setShareBeingDeleted } = useItemsFilteringContext();

    const canLock = useSelector(selectCanLockSession);
    const { inTrash, unselectItem } = useNavigationContext();

    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLButtonElement>();
    const withClose = <F extends (...args: any[]) => any>(cb: F) => pipe(cb, tap(close));

    const dispatch = useDispatch();

    const [deleteVault, setDeleteVault] = useState<MaybeNull<VaultShare>>(null);
    const [vaultModalProps, setVaultModalProps] = useState<MaybeNull<VaultModalProps>>(null);

    const handleVaultDelete = () => {
        if (deleteVault !== null) {
            handleVaultDeletionEffects(deleteVault.shareId, {
                shareId,
                setShareBeingDeleted,
                setShareId,
            });

            dispatch(vaultDeleteIntent({ id: deleteVault.shareId, content: deleteVault.content }));
        }
    };

    const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
    const handleRestoreTrash = () => dispatch(restoreTrashIntent());
    const handleDeleteAllItemsInTrash = () => dispatch(emptyTrashIntent());

    const openSettings = async (page?: string) => {
        const settingsUrl = browser.runtime.getURL('/settings.html');
        const url = `${settingsUrl}#/${page ?? ''}`;
        const match = await browser.tabs.query({ url: settingsUrl });

        await (match.length > 0
            ? browser.tabs.update(match[0].id, { highlighted: true, url })
            : browser.tabs.create({ url }));

        window.close();
    };

    const webStoreURL = getWebStoreUrl(detectBrowser());

    return (
        <>
            <nav className={className}>
                <Button icon shape="solid" color="weak" pill ref={anchorRef} onClick={toggle}>
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
                            selectedShareId={shareId}
                            handleVaultSelectClick={withClose((vaultShareId) => {
                                unselectItem();
                                setShareId(vaultShareId);
                                setSearch('');
                            })}
                            handleVaultDeleteClick={setDeleteVault}
                            handleVaultEditClick={withClose((vault: VaultShare) =>
                                setVaultModalProps({ open: true, payload: { type: 'edit', vault } })
                            )}
                            handleVaultCreateClick={withClose(() =>
                                setVaultModalProps({ open: true, payload: { type: 'new' } })
                            )}
                            inTrash={inTrash}
                            handleRestoreTrash={handleRestoreTrash}
                            handleEmptyTrash={() => setDeleteAllConfirm(true)}
                        />

                        <hr className="dropdown-item-hr my-2 mx-3" aria-hidden="true" />

                        <DropdownMenuButton
                            className="text-left flex flex-align-items-center flex-justify-space-between"
                            onClick={() => openSettings()}
                        >
                            <span className="flex flex-align-items-center">
                                <Icon name="cog-wheel" className="mr-3 color-weak" />
                                {c('Label').t`Settings`}
                            </span>

                            <Icon name="arrow-out-square" className="ml0-5 color-weak" />
                        </DropdownMenuButton>

                        <hr className="dropdown-item-hr my-2 mx-3" aria-hidden="true" />

                        {webStoreURL && (
                            <DropdownMenuButton
                                className="flex flex-align-items-center text-left"
                                onClick={() => window.open(webStoreURL, '_blank')}
                            >
                                <Icon name="star" className="mr-3 color-weak" />
                                {c('Action').t`Rate Pass`}
                            </DropdownMenuButton>
                        )}

                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            onClick={() => window.open('mailto:pass@proton.me', '_blank')}
                        >
                            <Icon name="bug" className="mr-3 color-weak" />
                            {c('Action').t`Report a problem`}
                        </DropdownMenuButton>

                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            onClick={withClose(sync)}
                            disabled={!ready}
                        >
                            <Icon name="arrow-rotate-right" className="mr-3 color-weak" />
                            {c('Action').t`Sync`}
                        </DropdownMenuButton>

                        {canLock && (
                            <DropdownMenuButton
                                className="flex flex-align-items-center text-left"
                                onClick={lock}
                                disabled={!ready}
                            >
                                <Icon name="lock" className="mr-3 color-weak" />
                                {c('Action').t`Lock ${PASS_APP_NAME}`}
                            </DropdownMenuButton>
                        )}

                        <DropdownMenuButton
                            className="flex flex-align-items-center text-left"
                            onClick={() => logout({ soft: false })}
                        >
                            <Icon name="arrow-out-from-rectangle" className="mr-3 color-weak" />
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

            <ConfirmationModal
                title={c('Title').t`Permanently remove all items ?`}
                open={deleteAllConfirm}
                onClose={() => setDeleteAllConfirm(false)}
                onSubmit={handleDeleteAllItemsInTrash}
                submitText={c('Action').t`Delete all`}
            >
                {c('Warning').t`All your trashed items will be permanently deleted. You can not undo this action.`}
            </ConfirmationModal>
        </>
    );
};

export const MenuDropdown = memo(MenuDropdownRaw);
