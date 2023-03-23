import type { VFC } from 'react';

import { c, msgid } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Slider } from '@proton/atoms/Slider';
import { Checkbox, Icon, Tooltip } from '@proton/components';
import clsx from '@proton/utils/clsx';

import { type UsePasswordGeneratorResult, getCharsGroupedByColor } from '../../../shared/hooks/usePasswordGenerator';

import './PasswordGenerator.scss';

export const PasswordGenerator: VFC<UsePasswordGeneratorResult & { standalone?: boolean }> = ({
    password,
    numberOfChars,
    useSpecialChars,
    standalone = false,
    setNumberOfChars,
    setUseSpecialChars,
    regeneratePassword,
}) => (
    <>
        <div
            className={clsx([
                'password-preview text-break-all bg-weak text-monospace rounded mb1 p1',
                standalone && 'pr3 relative',
            ])}
        >
            {getCharsGroupedByColor(password)}
            {standalone && (
                <div className="absolute top right mr0-5 mt0-5">
                    <Tooltip title={c('Action').t`Regenerate`}>
                        <Button icon onClick={regeneratePassword} size="small">
                            <Icon name="arrows-rotate" />
                        </Button>
                    </Tooltip>
                </div>
            )}
        </div>

        <div className="mb1">
            {c('Info').ngettext(msgid`${numberOfChars} character`, `${numberOfChars} characters`, numberOfChars)}
        </div>

        <Slider min={4} max={64} step={1} size="small" color="norm" value={numberOfChars} onInput={setNumberOfChars} />

        <Checkbox
            id="special-chars"
            checked={useSpecialChars}
            onChange={() => setUseSpecialChars(!useSpecialChars)}
            className="my1"
        >
            {c('Label').t`Special characters`}
        </Checkbox>
    </>
);
