import { type VFC, useMemo } from 'react';

import { isEmptyString } from '@proton/pass/utils/string';
import clsx from '@proton/utils/clsx';

import { getCharsGroupedByColor } from '../../hooks/usePasswordGenerator';

type Props = {
    fallback?: string;
    masked: boolean;
    password: string;
};

const PasswordFieldValue: VFC<Props> = ({ masked, password, fallback }) => {
    const isNonEmpty = !isEmptyString(password);

    const passwordDisplay = useMemo(() => {
        return (
            <div className={clsx('text-monospace', masked && 'user-select-none')}>
                {masked ? '••••••••••••••••••' : getCharsGroupedByColor(password)}
            </div>
        );
    }, [masked, password]);

    return (
        <div className="flex flex-align-items-center flex-nowrap">
            <div className="mr1 text-ellipsis flex-item-fluid">
                {isNonEmpty ? passwordDisplay : <span className="text-sm color-weak">{fallback}</span>}
            </div>
        </div>
    );
};

export default PasswordFieldValue;
