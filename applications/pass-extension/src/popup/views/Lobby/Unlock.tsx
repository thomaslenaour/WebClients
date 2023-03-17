import { type VFC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

import { selectRequestStatus, sessionUnlockIntent } from '@proton/pass/store';
import { unlockSession } from '@proton/pass/store/actions/requests';

import { PinCodeInput } from '../../../shared/components//session-lock/PinCodeInput';
import { useSessionLockPinSubmitEffect } from '../../../shared/components/session-lock/useSessionLockPinSubmitEffect';

export const Unlock: VFC = () => {
    const dispatch = useDispatch();
    const [value, setValue] = useState('');
    const status = useSelector(selectRequestStatus(unlockSession));
    const loading = status && status !== 'failure';

    useSessionLockPinSubmitEffect(value, {
        onSubmit: useCallback((pin) => dispatch(sessionUnlockIntent({ pin })), []),
    });

    return (
        <>
            <small className="mb1 text-center color-weak">{c('Info')
                .t`Enter your pin code to unlock your session`}</small>
            <PinCodeInput loading={loading} value={value} onValue={setValue} />
        </>
    );
};
