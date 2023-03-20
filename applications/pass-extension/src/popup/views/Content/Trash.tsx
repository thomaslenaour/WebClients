import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { c } from 'ttag';

import { Button, ButtonLike } from '@proton/atoms';
import { Dropdown, DropdownMenu, DropdownMenuButton, Icon, Tooltip, usePopperAnchor } from '@proton/components';
import { emptyTrashIntent, restoreTrashIntent } from '@proton/pass/store';

import { ConfirmationModal } from '../../../shared/components/confirmation/ConfirmationModal';
import { ContentLayout } from '../../../shared/components/content/ContentLayout';
import { TrashItemsList } from './TrashItemsList';

export const Trash = () => {
    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLButtonElement>();
    const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

    const dispatch = useDispatch();
    const handleRestoreItems = () => dispatch(restoreTrashIntent());
    const handleDeleteAllItemsInTrash = () => dispatch(emptyTrashIntent());

    return (
        <>
            <ContentLayout>
                <div className="flex flex-align-items-center">
                    <Tooltip title={c('Action').t`Back to vault`}>
                        <ButtonLike className="mr1" icon as={Link} to="/">
                            <Icon name="arrow-left" />
                        </ButtonLike>
                    </Tooltip>

                    <span className="text-bold text-xl">{c('Title').t`Trash`}</span>

                    <Tooltip title={c('Action').t`More actions`}>
                        <Button className="mlauto" icon onClick={toggle} ref={anchorRef}>
                            <Icon name="three-dots-horizontal" />
                        </Button>
                    </Tooltip>
                </div>
                <TrashItemsList />
            </ContentLayout>

            <Dropdown
                autoClose
                style={{ '--min-width': '18em', '--max-width': '30em' }}
                isOpen={isOpen}
                anchorRef={anchorRef}
                onClose={close}
                originalPlacement="left-end"
            >
                <DropdownMenu>
                    <DropdownMenuButton className="text-left" onClick={handleRestoreItems}>
                        <Icon name="arrow-up-and-left" className="mr1" />
                        {c('Label').t`Restore all items`}
                    </DropdownMenuButton>

                    <DropdownMenuButton className="text-left color-danger" onClick={() => setDeleteAllConfirm(true)}>
                        <Icon name="trash-cross" className="mr1" />
                        {c('Label').t`Permanently remove all items`}
                    </DropdownMenuButton>
                </DropdownMenu>
            </Dropdown>
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
