import { type VFC } from 'react';

import { c } from 'ttag';

import { Href } from '@proton/atoms';
import { getFormattedDateFromTimestamp } from '@proton/pass/utils/time/format';

import type { ItemTypeViewProps } from '../../../../shared/items/types';
import { ClickToCopyValue } from '../../../components/Controls/ClickToCopyValue';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { PasswordValueControl } from '../../../components/Controls/PasswordValueControl';
import { ValueControl } from '../../../components/Controls/ValueControl';
import { MoreInfoDropdown } from '../../../components/Dropdown/MoreInfoDropdown';
import { ItemViewPanel } from '../../../components/Panel/ItemViewPanel';

export const LoginView: VFC<ItemTypeViewProps<'login'>> = ({ vault, revision, ...itemViewProps }) => {
    const { data: item, createTime, lastUseTime, modifyTime, revision: revisionNumber } = revision;
    const { metadata, content } = item;
    const { name, note } = metadata;
    const { username, password, urls } = content;

    return (
        <ItemViewPanel type="login" name={name} vaultName={vault.content.name} {...itemViewProps}>
            <FieldsetCluster mode="read" as="div">
                <ClickToCopyValue value={username}>
                    <ValueControl interactive icon="user" label={c('Label').t`Username`}>
                        {username}
                    </ValueControl>
                </ClickToCopyValue>

                <PasswordValueControl password={password} />
            </FieldsetCluster>

            {urls.length > 0 && (
                <FieldsetCluster mode="read" as="div">
                    <ValueControl interactive icon="earth" label={c('Label').t`Websites`}>
                        {urls.map((url) => (
                            <Href className="block mb-1 text-ellipsis" href={url} key={url}>
                                {url}
                            </Href>
                        ))}
                    </ValueControl>
                </FieldsetCluster>
            )}

            {note && (
                <FieldsetCluster mode="read" as="div">
                    <ValueControl as="pre" icon="note" label={c('Label').t`Note`}>
                        {note}
                    </ValueControl>
                </FieldsetCluster>
            )}

            <MoreInfoDropdown
                info={[
                    {
                        label: c('Label').t`Last autofill`,
                        values: [lastUseTime ? getFormattedDateFromTimestamp(lastUseTime) : c('Info').t`None`],
                    },
                    {
                        label: c('Label').t`Modified`,
                        values: [
                            `${revisionNumber} ${c('Info').t`time(s)`}`,
                            getFormattedDateFromTimestamp(modifyTime),
                        ],
                    },
                    { label: c('Label').t`Created`, values: [getFormattedDateFromTimestamp(createTime)] },
                ]}
            />
        </ItemViewPanel>
    );
};
