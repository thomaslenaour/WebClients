import type { ElementType, FC, ReactNode, VFC } from 'react';

import { Icon, type IconName, InputFieldTwo } from '@proton/components';
import type { InputFieldProps } from '@proton/components/components/v2/field/InputField';
import type { ItemType } from '@proton/pass/types';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { BaseInputGroup, Props as BaseInputGroupProps } from './InputGroup';

const OVERRIDEN_PROPS = {
    assistContainerClassName: 'hidden-empty',
} as const;

const OVERRIDEN_INPUT_ONLY_PROPS = {
    unstyled: true,
    labelContainerClassName: 'color-norm text-normal',
    inputClassName: 'color-norm p-0',
} as const;

const STATUS_PROPS_MAP = {
    default: {
        icon: { style: { color: 'var(--field-placeholder-color)' } },
        input: {},
    },
    error: {
        icon: { style: { color: 'var(--signal-danger)' } },
        input: {
            labelContainerClassName: 'color-danger text-normal',
        },
    },
} as const;

export type CustomControlBaseProps = {
    status?: keyof typeof STATUS_PROPS_MAP;
    actions: ReactNode | ReactNode[];
    itemType?: ItemType;
    icon?: IconName;
    customInputGroupProps?: Partial<BaseInputGroupProps>;
};

type CustomControlRenderProps = (typeof STATUS_PROPS_MAP)[keyof typeof STATUS_PROPS_MAP]['input'];

export const CustomInputControl: VFC<
    CustomControlBaseProps & { children: (renderProps: CustomControlRenderProps) => ReactNode }
> = ({ icon, status = 'default', actions, itemType, children, customInputGroupProps }) => {
    return (
        <BaseInputGroup
            icon={icon && <Icon name={icon} size={24} {...STATUS_PROPS_MAP[status].icon} />}
            actions={actions}
            actionsContainerClassName={itemType ? itemTypeToItemClassName[itemType] : undefined}
            {...customInputGroupProps}
        >
            {children(STATUS_PROPS_MAP[status].input)}
        </BaseInputGroup>
    );
};

export type Props<T extends ElementType = typeof InputFieldTwo> = Omit<
    InputFieldProps<T>,
    keyof typeof OVERRIDEN_PROPS & keyof typeof OVERRIDEN_INPUT_ONLY_PROPS
> &
    CustomControlBaseProps & { type?: 'text' | 'password' };

export const InputControl: FC<Props> = ({ icon, status = 'default', actions, itemType, ...rest }) => {
    return (
        <CustomInputControl
            icon={icon}
            status={status}
            actions={actions}
            itemType={itemType}
            customInputGroupProps={{ className: 'px-4 py-3' }}
        >
            {(inputProps) => (
                <InputFieldTwo
                    {...(!('as' in rest) && OVERRIDEN_INPUT_ONLY_PROPS)}
                    {...OVERRIDEN_PROPS}
                    {...inputProps}
                    {...rest}
                />
            )}
        </CustomInputControl>
    );
};
