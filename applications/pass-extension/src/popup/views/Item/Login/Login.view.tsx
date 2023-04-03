import { type VFC, useState } from 'react';

import { c } from 'ttag';

import { Button, Href } from '@proton/atoms';
import { Icon, Tooltip } from '@proton/components/components';
import { getFormattedDateFromTimestamp } from '@proton/pass/utils/time/format';

import { PasswordFieldValue } from '../../../../shared/components/fields';
import type { ItemTypeViewProps } from '../../../../shared/items/types';
import { ClickToCopyValue } from '../../../components/Controls/ClickToCopyValue';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { ValueControl } from '../../../components/Controls/ValueControl';
import { MoreInfoDropdown } from '../../../components/Dropdown/MoreInfoDropdown';
import { ItemViewPanel } from '../../../components/Panel/ItemViewPanel';

export const LoginView: VFC<ItemTypeViewProps<'login'>> = ({ vault, revision, ...itemViewProps }) => {
    const { data: item, createTime, lastUseTime, modifyTime, revision: revisionNumber } = revision;
    const { metadata, content } = item;
    const { name, note } = metadata;
    const { username, password, urls } = content;

    const [passwordMasked, setPasswordMasked] = useState(true);

    return (
        <ItemViewPanel type="login" name={name} vaultName={vault.content.name} {...itemViewProps}>
            <FieldsetCluster mode="read" as="div">
                <ClickToCopyValue value={username}>
                    <ValueControl interactive icon="user" label={c('Label').t`Username`}>
                        {username}
                    </ValueControl>
                </ClickToCopyValue>

                <ClickToCopyValue value={password}>
                    <ValueControl
                        interactive
                        actions={
                            <Tooltip
                                title={passwordMasked ? c('Action').t`Show password` : c('Action').t`Hide password`}
                            >
                                <Button
                                    icon
                                    pill
                                    color="weak"
                                    onClick={() => setPasswordMasked((prev) => !prev)}
                                    size="medium"
                                    shape="solid"
                                >
                                    <Icon name={passwordMasked ? 'eye' : 'eye-slash'} />
                                </Button>
                            </Tooltip>
                        }
                        icon="key"
                        label={c('Label').t`Password`}
                    >
                        <PasswordFieldValue fallback={c('Info').t`None`} masked={passwordMasked} password={password} />
                    </ValueControl>
                </ClickToCopyValue>
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
                items={[
                    ...(lastUseTime
                        ? [{ label: c('Label').t`Last used`, values: [getFormattedDateFromTimestamp(lastUseTime)] }]
                        : []),
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
