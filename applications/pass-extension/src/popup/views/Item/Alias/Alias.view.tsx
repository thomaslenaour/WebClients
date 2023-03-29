import { type VFC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleHeader,
    CollapsibleHeaderIconButton,
    Icon,
    useNotifications,
} from '@proton/components';
import {
    aliasDetailsRequested,
    selectMailboxesForAlias,
    selectRequestInFlight,
    selectRequestStatus,
} from '@proton/pass/store';
import * as requests from '@proton/pass/store/actions/requests';
import { getFormattedDateFromTimestamp } from '@proton/pass/utils/time/format';

import { ItemTypeViewProps } from '../../../../shared/items/types';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { ValueControl } from '../../../components/Controls/ValueControl';
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
    const { data: item, aliasEmail, createTime, itemId } = revision;
    const {
        metadata: { name, note },
    } = item;

    const dispatch = useDispatch();
    const { createNotification } = useNotifications();
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

    useEffect(() => {
        if (requestFailure) {
            createNotification({
                type: 'warning',
                text: c('Warning').t`Cannot retrieve mailboxes for this alias right now`,
            });
        }
    }, [requestFailure]);

    const copyAliasEmail = () => {
        if (aliasEmail) {
            navigator.clipboard.writeText(aliasEmail);
            createNotification({ type: 'success', text: c('Info').t`Copied to clipboard` });
        }
    };

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
            <FieldsetCluster mode="read" as="div">
                <ValueControl icon="alias" label={c('Label').t`Alias address`} onClick={copyAliasEmail}>
                    {aliasEmail}
                </ValueControl>
                <ValueControl icon="arrow-up-and-right-big" label={c('Label').t`Forwarded to`}>
                    {requestFailure && <div className="extension-skeleton extension-skeleton--select" />}
                    {ready &&
                        mailboxesForAlias.map(({ email }) => (
                            <div key={email} className="text-ellipsis mb0-5">
                                {email}
                            </div>
                        ))}
                </ValueControl>
            </FieldsetCluster>

            {note && (
                <FieldsetCluster mode="read" as="div">
                    <ValueControl icon="note" label={c('Label').t`Note`}>
                        <pre>{note}</pre>
                    </ValueControl>
                </FieldsetCluster>
            )}

            <Collapsible>
                <CollapsibleHeader
                    disableFullWidth
                    suffix={
                        <CollapsibleHeaderIconButton>
                            <Icon name="chevron-down" className="color-weak" />
                        </CollapsibleHeaderIconButton>
                    }
                >
                    <span className="flex flex-align-items-center color-weak">
                        <Icon className="mr-1" name="info-circle" />
                        <span>{c('Button').t`More info`}</span>
                    </span>
                </CollapsibleHeader>
                <CollapsibleContent>
                    <FieldsetCluster mode="read" as="div">
                        <ValueControl label={c('Label').t`Created on`}>
                            {getFormattedDateFromTimestamp(createTime)}
                        </ValueControl>
                    </FieldsetCluster>
                </CollapsibleContent>
            </Collapsible>
        </ItemViewPanel>
    );
};
