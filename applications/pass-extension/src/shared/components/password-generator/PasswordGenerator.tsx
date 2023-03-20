import { FC } from 'react';

import { c, msgid } from 'ttag';

import { Button } from '@proton/atoms';
import { Slider } from '@proton/atoms/Slider';
import { Checkbox, Icon, Tooltip } from '@proton/components/components';
import clsx from '@proton/utils/clsx';

import { CharType, PasswordGeneratorContextValue, alphabeticChars, digits } from '../../hooks/usePasswordGenerator';

import './PasswordGenerator.scss';

const charTypeToClassName = {
    [CharType.Alphabetic]: '',
    [CharType.Digit]: 'password-generator-char-digit',
    [CharType.Special]: 'password-generator-char-special',
};

const getTypeFromChar = (char: string) => {
    if (alphabeticChars.includes(char)) {
        return CharType.Alphabetic;
    }

    if (digits.includes(char)) {
        return CharType.Digit;
    }

    return CharType.Special;
};

export const getCharsGroupedByColor = (password: string) => {
    if (password.length === 0) {
        return [];
    }

    const [head, ...chars] = Array.from(password);
    const startType = getTypeFromChar(head);

    return chars
        .reduce(
            (state, currentChar) => {
                const currentElement = state[state.length - 1];
                const previousType = currentElement.color;
                const currentType = getTypeFromChar(currentChar);

                return previousType !== currentType
                    ? [...state, { color: currentType, content: currentChar }]
                    : [...state.slice(0, -1), { color: previousType, content: currentElement.content + currentChar }];
            },
            [{ color: startType, content: head }]
        )
        .map(({ color, content }, index) => (
            <span className={charTypeToClassName[color]} key={index}>
                {content}
            </span>
        ));
};

/*
 * This component is a bit naked in that it groups a couple of ui elements with no
 * common container, but it serves it purpose as needs be for now.
 */
export const PasswordGenerator: FC<PasswordGeneratorContextValue & { standalone?: boolean }> = ({
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
