import type { VFC } from 'react';

import { InputFieldTwo, TotpInput } from '@proton/components/components';
import clsx from '@proton/utils/clsx';

export const PinCodeInput: VFC<{ value: string; onValue: (value: string) => void; loading?: boolean }> = ({
    value,
    onValue,
    loading = false,
}) => {
    return (
        <InputFieldTwo
            dense
            as={TotpInput}
            length={6}
            value={value}
            onValue={onValue}
            autoFocus
            inputType="password"
            /* TODO support proper disabled prop on TotpInput */
            disableChange={loading}
            rootClassName={clsx(loading && 'opacity-30 no-pointer-events')}
        />
    );
};
