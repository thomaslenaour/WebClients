import { VFC, useMemo, useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon } from '@proton/components/components';
import { isEmptyString } from '@proton/pass/utils/string';
import clsx from '@proton/utils/clsx';

import { getCharsGroupedByColor } from '../../../shared/hooks/usePasswordGenerator';
import { ClickToCopyValue } from './ClickToCopyValue';
import { ValueControl } from './ValueControl';

type Props = {
    password: string;
};

export const PasswordValueControl: VFC<Props> = ({ password }) => {
    const [masked, setMasked] = useState(true);
    const isEmpty = isEmptyString(password);

    const passwordDisplay = useMemo(() => {
        if (isEmpty) {
            return <div className="color-weak">{c('Info').t`None`}</div>;
        }

        return (
            <div className={clsx('text-monospace', masked && 'user-select-none')}>
                {masked ? '••••••••••••••••••' : getCharsGroupedByColor(password)}
            </div>
        );
    }, [masked, password]);

    return (
        <ClickToCopyValue value={password}>
            <ValueControl
                interactive={!isEmpty}
                actions={
                    !isEmpty && (
                        <Button
                            icon
                            pill
                            aria-label={c('Label').t`Toggle password mask`}
                            color="weak"
                            onClick={() => setMasked((prev) => !prev)}
                            size="medium"
                            shape="solid"
                        >
                            <Icon name={masked ? 'eye' : 'eye-slash'} />
                        </Button>
                    )
                }
                icon="key"
                label={c('Label').t`Password`}
            >
                {passwordDisplay}
            </ValueControl>
        </ClickToCopyValue>
    );
};
