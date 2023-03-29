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
import clsx from '@proton/utils/clsx';

import { ItemTypeViewProps } from '../../../../shared/items/types';
import { ClickToCopyValue } from '../../../components/Controls/ClickToCopyValue';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { ValueControl } from '../../../components/Controls/ValueControl';
import { ItemViewPanel } from '../../../components/Panel/ItemViewPanel';

export const AliasView: VFC<ItemTypeViewProps<'alias'>> = ({ vault, revision, ...itemViewProps }) => {
    const { data: item, itemId, aliasEmail, createTime, revision: revisionNumber } = revision;
    const { name, note } = item.metadata;
    const { optimistic } = itemViewProps;

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

    return (
        <ItemViewPanel type="alias" name={name} vaultName={vault.content.name} {...itemViewProps}>
            <FieldsetCluster mode="read" as="div">
                <ClickToCopyValue value={aliasEmail ?? ''}>
                    <ValueControl interactive icon="alias" label={c('Label').t`Alias address`}>
                        {aliasEmail}
                    </ValueControl>
                </ClickToCopyValue>

                <ValueControl as="ul" icon="arrow-up-and-right-big" label={c('Label').t`Forwarded to`}>
                    {requestFailure && <div className="extension-skeleton extension-skeleton--select" />}
                    {ready &&
                        mailboxesForAlias.map(({ email }, i) => (
                            <li
                                key={email}
                                className={clsx('text-ellipsis', i < mailboxesForAlias.length - 1 && 'mb-2')}
                            >
                                {email}
                            </li>
                        ))}
                </ValueControl>
            </FieldsetCluster>

            {note && (
                <FieldsetCluster mode="read" as="div">
                    <ValueControl as="pre" icon="note" label={c('Label').t`Note`}>
                        {note}
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
                        <ValueControl label={c('Label').t`Revision number`}>{revisionNumber}</ValueControl>
                    </FieldsetCluster>
                </CollapsibleContent>
            </Collapsible>
        </ItemViewPanel>
    );
};
