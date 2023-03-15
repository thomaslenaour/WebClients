import { FC } from 'react';

import { c } from 'ttag';

import { getCharsGroupedByColor } from '../../../../shared/components/password-generator';
import { generatePassword } from '../../../../shared/hooks';
import { DropdownIframeMessage, DropdownMessageType } from '../../../types';
import { IFrameMessageBroker } from '../../iframe/messages';
import { DropdownItem } from '../components/DropdownItem';

export const PasswordAutoSuggest: FC = () => {
    const password = generatePassword({ useSpecialChars: true, length: 24 });

    return (
        <DropdownItem
            onClick={() =>
                IFrameMessageBroker.postMessage<DropdownIframeMessage>({
                    sender: 'dropdown',
                    type: DropdownMessageType.AUTOFILL_PASSWORD,
                    payload: { password },
                })
            }
            title={c('Title').t`Use secure password`}
            subTitle={<span className="text-monospace">{getCharsGroupedByColor(password)}</span>}
            icon="key"
        />
    );
};
