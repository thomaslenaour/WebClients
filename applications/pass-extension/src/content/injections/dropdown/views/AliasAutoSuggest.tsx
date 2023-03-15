import { FC } from 'react';

import { c } from 'ttag';

import { AliasState } from '@proton/pass/store';

import AliasPreview from '../../../../shared/components/alias/Alias.preview';
import { DropdownIframeMessage, DropdownMessageType } from '../../../types';
import { IFrameMessageBroker } from '../../iframe/messages';
import { DropdownItem } from '../components/DropdownItem';

export const AliasAutoSuggest: FC<{ options: AliasState['aliasOptions']; prefix: string }> = ({ options, prefix }) => {
    const defaultSuffix = options?.suffixes?.[0];

    return (
        <DropdownItem
            disabled={options === null || defaultSuffix === undefined}
            onClick={() =>
                options !== null &&
                defaultSuffix !== undefined &&
                IFrameMessageBroker.postMessage<DropdownIframeMessage>({
                    sender: 'dropdown',
                    type: DropdownMessageType.AUTOFILL_ALIAS,
                    payload: {
                        alias: {
                            mailboxes: [options.mailboxes?.[0]],
                            prefix,
                            signedSuffix: defaultSuffix.signedSuffix,
                            aliasEmail: `${prefix}${defaultSuffix.suffix}`,
                        },
                    },
                })
            }
            title={c('Title').t`Create email alias`}
            subTitle={
                defaultSuffix ? (
                    <AliasPreview prefix={prefix} suffix={defaultSuffix.suffix} standalone />
                ) : (
                    <span className="color-danger">{c('Warning').t`Cannot create alias`}</span>
                )
            }
            icon="alias"
        />
    );
};
