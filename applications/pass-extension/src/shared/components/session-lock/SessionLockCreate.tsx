import { type VFC, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { c } from 'ttag';

import { useNotifications } from '@proton/components/index';
import { sessionLockEnableIntent } from '@proton/pass/store';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { ExtensionContext } from '../../extension';
import { SessionLockPinModal } from './SessionLockPinModal';
import { useConfirmSessionLockPin } from './useConfirmSessionLockPin';

type Props = {
    opened: boolean;
    onClose: () => void;
};

export const SessionLockCreate: VFC<Props> = ({ opened, onClose }) => {
    const dispatch = useDispatch();
    const { createNotification } = useNotifications();

    const [processing, setProcessing] = useState(false);
    const [confirm, confirmSessionLockPinModal] = useConfirmSessionLockPin();

    const handleClose = useCallback(() => {
        setProcessing(false);
        onClose();
    }, [onClose]);

    const handleOnSubmit = useCallback(
        async (pin: string) => {
            await confirm(
                (confirmPin) => {
                    setProcessing(true);

                    if (pin !== confirmPin) {
                        createNotification({
                            type: 'error',
                            text: c('Error').t`PIN codes do not match`,
                        });
                        throw new Error('invalid');
                    }

                    dispatch(
                        sessionLockEnableIntent(
                            { pin: confirmPin, ttl: 900 /* default to 15 minutes */ },
                            ExtensionContext.get().endpoint
                        )
                    );

                    return handleClose();
                },
                {
                    title: c('Title').t`Confirm PIN code`,
                    text: c('Info')
                        .t`Please confirm your PIN code in order to finish registering your auto-lock settings.`,
                    onClose: handleClose,
                }
            );
        },
        [handleClose]
    );

    return (
        <>
            <SessionLockPinModal
                open={opened && !processing}
                title={c('Title').t`Create PIN code`}
                assistiveText={c('Info')
                    .t`You will use this PIN to unlock ${PASS_APP_NAME} once it auto-locks after a period of inactivity.`}
                onSubmit={handleOnSubmit}
                onClose={handleClose}
            />

            {confirmSessionLockPinModal}
        </>
    );
};
