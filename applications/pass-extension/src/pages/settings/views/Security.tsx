import { type VFC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

import { Checkbox } from '@proton/components';
import { selectRequestInFlight, selectSessionLockSettings, sessionLockDisableIntent } from '@proton/pass/store';
import { settingsEdit } from '@proton/pass/store/actions/requests';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { useSessionLockConfirmContext } from '../../../shared/components/session-lock/SessionLockConfirmContextProvider';
import { SessionLockCreate } from '../../../shared/components/session-lock/SessionLockCreate';
import { SessionLockTTLUpdate } from '../../../shared/components/session-lock/SessionLockTTLUpdate';
import { ExtensionContext } from '../../../shared/extension';

export const Security: VFC = () => {
    const dispatch = useDispatch();
    const { endpoint } = ExtensionContext.get();

    const [lockCreationModalOpened, setLockCreationModalOpened] = useState(false);
    const { confirmPin } = useSessionLockConfirmContext();

    const { sessionLockToken, sessionLockTTL } = useSelector(selectSessionLockSettings);
    const sessionLockLoading = useSelector(selectRequestInFlight(settingsEdit('session-lock')));

    const hasLock = sessionLockToken !== undefined;

    const handleSessionLockToggle = async () =>
        hasLock
            ? confirmPin({
                  onSubmit: (pin) => dispatch(sessionLockDisableIntent({ pin }, endpoint)),
                  assistiveText: c('Info').t`Please confirm your PIN code in order to unregister your current lock.
                        ${PASS_APP_NAME} will then never lock.`,
              })
            : setLockCreationModalOpened(true);

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
        </div>
    );
};
