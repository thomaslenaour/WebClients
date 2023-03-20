import { type VFC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

import { Checkbox } from '@proton/components';
import {
    acknowledge,
    selectRequestStatus,
    selectSessionLockSettings,
    sessionLockDisableIntent,
} from '@proton/pass/store';
import { settingsEdit } from '@proton/pass/store/actions/requests';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { useConfirmSessionLockPin } from '../../../shared//components/session-lock/useConfirmSessionLockPin';
import { SessionLockCreate } from '../../../shared/components/session-lock/SessionLockCreate';
import { SessionLockTTLUpdate } from '../../../shared/components/session-lock/SessionLockTTLUpdate';
import { ExtensionContext } from '../../../shared/extension';

export const Security: VFC = () => {
    const dispatch = useDispatch();
    const { endpoint } = ExtensionContext.get();

    const [lockCreationModalOpened, setLockCreationModalOpened] = useState(false);
    const [confirmPin, confirmSessionLockPinModal] = useConfirmSessionLockPin();

    const { sessionLockToken, sessionLockTTL } = useSelector(selectSessionLockSettings);
    const sessionLockStatus = useSelector(selectRequestStatus(settingsEdit('session-lock')));
    const sessionLockLoading = sessionLockStatus === 'start';
    const hasLock = sessionLockToken !== undefined;

    const handleSessionLockToggle = async () =>
        hasLock
            ? confirmPin((pin) => dispatch(sessionLockDisableIntent({ pin }, endpoint)), {
                  text: c('Info')
                      .t`Please confirm your PIN code in order to unregister your current lock. ${PASS_APP_NAME} will then never lock.`,
              })
            : setLockCreationModalOpened(true);

    useEffect(() => {
        if (sessionLockStatus === 'success') {
            dispatch(acknowledge(settingsEdit('session-lock')));
        }
    }, [sessionLockStatus]);

    return (
        <div className="my1">
            <strong className="color-norm block mb0-5 block">{c('Label').t`Session locking`}</strong>
            <Checkbox className="mb1" checked={hasLock} onChange={handleSessionLockToggle} loading={sessionLockLoading}>
                <span className="ml0-75">
                    {c('Label').t`Auto-lock ${PASS_APP_NAME}`}
                    <span className="block text-xs">{c('Info')
                        .t`Access to ${PASS_APP_NAME} will require a pin code to unlock your session`}</span>
                </span>
            </Checkbox>

            <SessionLockCreate opened={lockCreationModalOpened} onClose={() => setLockCreationModalOpened(false)} />
            <SessionLockTTLUpdate ttl={sessionLockTTL} disabled={!sessionLockToken || sessionLockLoading} />

            {confirmSessionLockPinModal}
        </div>
    );
};
