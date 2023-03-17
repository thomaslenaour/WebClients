import { createAction } from '@reduxjs/toolkit';
import { c } from 'ttag';

import { Share } from '@proton/pass/types';
import { ServerEvent } from '@proton/pass/types/api';
import { isVaultShare } from '@proton/pass/utils/pass/share';

import withNotification from '../with-notification';

export const serverEvent = createAction('server event', (event: ServerEvent) => ({ payload: { event } }));

export const disabledShareEvent = createAction('share disabled', (share: Share) =>
    withNotification({
        type: 'info',
        text: isVaultShare(share)
            ? c('Info').t`Vault "${share.content.name}" was disabled`
            : c('Info').t`An item previously shared with you was disabled`,
    })({ payload: { shareId: share.shareId } })
);
