import type { ReactNode, VFC } from 'react';

import { Icon, type IconName, InputFieldTwo } from '@proton/components';
import type { InputFieldProps } from '@proton/components/components/v2/field/InputField';
import type { ItemType } from '@proton/pass/types';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { InputGroup } from './InputGroup';

const OVERRIDEN_PROPS = {
    unstyled: true,
    assistContainerClassName: 'hidden-empty',

    labelContainerClassName: 'color-norm text-normal',
    inputClassName: 'color-norm p-0',
} as const;

const STATUS_PROPS_MAP = {
    default: {
        icon: { style: { color: 'currentcolor' } },
        input: {},
    },
    error: {
        icon: { style: { color: 'var(--signal-danger)' } },
        input: {
            labelContainerClassName: 'color-danger text-normal',
        },
    },
} as const;

export type Props = Omit<InputFieldProps<typeof InputFieldTwo>, keyof typeof OVERRIDEN_PROPS> & {
    status?: keyof typeof STATUS_PROPS_MAP;
    actions: ReactNode | ReactNode[];
    itemType?: ItemType;
    icon?: IconName;
    type: 'text' | 'password';
};

export const InputControl: VFC<Props> = ({ icon, status = 'default', actions, itemType, ...rest }) => {
    return (
        <InputGroup
            icon={icon && <Icon name={icon} size={24} {...STATUS_PROPS_MAP[status].icon} />}
            actions={actions}
            actionsContainerClassName={itemType ? itemTypeToItemClassName[itemType] : undefined}
        >
            <InputFieldTwo {...OVERRIDEN_PROPS} {...STATUS_PROPS_MAP[status].input} {...rest} />
        </InputGroup>
    );
};
