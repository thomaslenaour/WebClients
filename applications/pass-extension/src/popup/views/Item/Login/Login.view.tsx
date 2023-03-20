import type { VFC } from 'react';

import { c } from 'ttag';

import { PasswordFieldValue, TextFieldValue, UrlFieldValue } from '../../../../shared/components/fields';
import type { ItemTypeViewProps } from '../../../../shared/items/types';
import { ItemViewPanel } from '../../../components/Panel/ItemViewPanel';

export const LoginView: VFC<ItemTypeViewProps<'login'>> = ({
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
    const { data: item } = revision;
    const { metadata, content } = item;
    const { name, note } = metadata;
    const { username, password, urls } = content;

    return (
        <ItemViewPanel
            type="login"
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
            <div className="text-semibold mb0-5"> {c('Label').t`Username`}</div>
            <TextFieldValue fallback={c('Info').t`None`}>{username}</TextFieldValue>

            <hr className="my0-5" />

            <div className="text-semibold mb0-5"> {c('Label').t`Password`}</div>
            <PasswordFieldValue fallback={c('Info').t`None`}>{password}</PasswordFieldValue>

            {urls.length > 0 && (
                <>
                    <hr className="my0-5" />
                    <div className="text-semibold mb0-5"> {c('Label').t`Websites`}</div>
                    {urls.map((url) => (
                        <UrlFieldValue key={url}>{url}</UrlFieldValue>
                    ))}
                </>
            )}

            {note && (
                <>
                    <hr className="my0-5" />
                    <div className="text-bold mb0-5"> {c('Label').t`Note`}</div>
                    <div>{note}</div>
                </>
            )}
        </ItemViewPanel>
    );
};
