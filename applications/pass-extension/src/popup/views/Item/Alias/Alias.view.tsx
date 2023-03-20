import { type VFC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

import { Icon } from '@proton/components/components';
import {
    aliasDetailsRequested,
    selectMailboxesForAlias,
    selectRequestInFlight,
    selectRequestStatus,
} from '@proton/pass/store';
import * as requests from '@proton/pass/store/actions/requests';

import { TextFieldValue } from '../../../../shared/components/fields';
import { ItemTypeViewProps } from '../../../../shared/items/types';
import { ItemViewPanel } from '../../../components/Panel/ItemViewPanel';

export const AliasView: VFC<ItemTypeViewProps<'alias'>> = ({
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
    const { data: item, aliasEmail, itemId } = revision;
    const {
        metadata: { name, note },
    } = item;

    const dispatch = useDispatch();
    const mailboxesForAlias = useSelector(selectMailboxesForAlias(aliasEmail!));
    const aliasDetailsLoading = useSelector(selectRequestInFlight(requests.aliasDetails(aliasEmail!)));
    const aliasDetailsRequestStatus = useSelector(selectRequestStatus(requests.aliasDetails(aliasEmail!)));

    const ready = !aliasDetailsLoading && mailboxesForAlias !== undefined;
    const requestFailure = aliasDetailsRequestStatus === 'failure' && mailboxesForAlias === undefined;

    useEffect(() => {
        if (!optimistic && mailboxesForAlias === undefined) {
            dispatch(aliasDetailsRequested({ shareId: vault.shareId, itemId, aliasEmail: aliasEmail! }));
        }
    }, [optimistic, vault, itemId, mailboxesForAlias]);

    return (
        <ItemViewPanel
            type="alias"
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
            <div className="text-semibold mb0-5"> {c('Label').t`Alias`}</div>
            <TextFieldValue>{aliasEmail!}</TextFieldValue>

            <hr className="my0-5" />
            <div className="text-bold mb0-5">{c('Label').t`Mailboxes`}</div>

            <div className="mb1">
                {aliasDetailsLoading && <div className="extension-skeleton extension-skeleton--alias-mailbox" />}

                {requestFailure && (
                    <span className="color-warning mt0-25">
                        <Icon name="exclamation-circle" />{' '}
                        <small>{c('Warning').t`Cannot retrieve mailboxes for this alias right now`}</small>
                    </span>
                )}

                {ready &&
                    mailboxesForAlias.map(({ email }) => (
                        <div key={email} className="text-ellipsis mb0-5">
                            {email}
                        </div>
                    ))}
            </div>

            {note && (
                <>
                    <hr className="my0-5" />
                    <div className="text-bold mb0-5">{c('Label').t`Note`}</div>
                    <div>{note}</div>
                </>
            )}
        </ItemViewPanel>
    );
};
