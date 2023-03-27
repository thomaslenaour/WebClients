import { Children, type ReactElement, cloneElement } from 'react';

import { Icon, type IconName, InputButton } from '@proton/components';
import type { ColorRGB } from '@proton/pass/types';

import './RadioButtonGroup.scss';

type RadioButtonProps<T = unknown> = {
    value: T;
    onChange?: (value: T) => void;
    selected?: boolean;
    color?: ColorRGB;
    icon?: IconName;
    name?: string;
};

type Props<T = unknown> = {
    value?: T;
    onValue?: (value: T) => void;
    children: ReactElement<RadioButtonProps<T>>[];
    name: string;
};

export const RadioButton = <T,>({ onChange, selected, value, name, color, icon }: RadioButtonProps<T>) => {
    return (
        <InputButton
            type="radio"
            name={name}
            checked={selected}
            onChange={(e) => e.target.checked && onChange?.(value)}
            labelProps={{
                className: 'pass-radio-group--button',
                style: { '--radio-button-background': color ? `rgb(${color})` : 'var(--background-weak)' },
            }}
        >
            {icon && <Icon name={icon} size={20} />}
        </InputButton>
    );
};

export const RadioButtonGroup = <T extends any>(props: Props<T>) => {
    const items = Children.map(props.children, (child) => {
        return cloneElement(child, {
            onChange: (value: T) => props.onValue?.(value),
            selected: props.value === child.props.value,
            name: props.name,
        });
    });

    return <div className="flex flex-justify-space-between gap-x-6 gap-y-4">{items}</div>;
};
