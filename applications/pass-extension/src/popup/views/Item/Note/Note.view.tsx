import { type VFC } from 'react';

import type { ItemTypeViewProps } from '../../../../shared/items/types';
import { ItemViewPanel } from '../../../components/Panel/ItemPanel';

export const NoteView: VFC<ItemTypeViewProps<'note'>> = ({
    vault,
    revision,
    optimistic,
    failed,
    trashed,
    handleEditClick,
    handleMoveToTrashClick,
    handleRetryClick,
    handleDismissClick,
    handleRestoreClick,
    handleDeleteClick,
}) => {
    const {
        data: {
            metadata: { note, name },
        },
    } = revision;

    return (
        <ItemViewPanel
            type="note"
            name={name}
            vaultName={vault.content.name}
            optimistic={optimistic}
            failed={failed}
            trashed={trashed}
            handleEditClick={handleEditClick}
            handleRetryClick={handleRetryClick}
            handleDismissClick={handleDismissClick}
            handleMoveToTrashClick={handleMoveToTrashClick}
            handleRestoreClick={handleRestoreClick}
            handleDeleteClick={handleDeleteClick}
        >
            <div className="text-break">{note}</div>
        </ItemViewPanel>
    );
};
