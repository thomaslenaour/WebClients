import { type FC, useMemo, useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { useNotifications } from '@proton/components';
import { Copy, Icon, Tooltip } from '@proton/components/components';
import { isEmptyString } from '@proton/pass/utils/string';
import range from '@proton/utils/range';

import { getCharsGroupedByColor } from '../../hooks/usePasswordGenerator';

const PASSWORD_LENGTH = 10;

const PasswordFieldValue: FC<{ children: string; fallback?: string }> = ({ children, fallback }) => {
    const { createNotification } = useNotifications();

    const [masked, setMasked] = useState(true);
    const isNonEmpty = !isEmptyString(children);

    const password = useMemo(
        () =>
            masked ? (
                <span className="text-sm text-monospace" style={{ letterSpacing: 2 }}>
                    {range(0, PASSWORD_LENGTH).map((i) => (
                        <span key={i}>●</span>
                    ))}
                </span>
            ) : (
                <span className="user-select text-monospace">{getCharsGroupedByColor(children)}</span>
            ),
        [masked, children]
    );

    return (
        <div className="flex flex-align-items-center flex-nowrap">
            <div className="mr1 text-ellipsis flex-item-fluid">
                {isNonEmpty ? password : <span className="text-sm color-weak">{fallback}</span>}
            </div>
            {isNonEmpty && (
                <>
                    <Tooltip title={masked ? c('Action').t`Show password` : c('Action').t`Hide password`}>
                        <Button
                            className="inline-flex flex-item-noshrink mr0-5"
                            icon
                            onClick={() => setMasked((val) => !val)}
                        >
                            <Icon className="mauto" name={masked ? 'eye' : 'eye-slash'} />
                        </Button>
                    </Tooltip>
                    <Copy
                        className="mlauto flex-item-noshrink"
                        value={children}
                        onCopy={() => createNotification({ type: 'success', text: c('Info').t`Copied to clipboard` })}
                    />
                </>
            )}
        </div>
    );
};

export default PasswordFieldValue;
