import type { ReactNode, VFC } from 'react';

import { Icon, type IconName } from '@proton/components';
import type { ItemType, MaybeArray } from '@proton/pass/types';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { InputGroup } from './InputGroup';

type Props = {
    actions?: MaybeArray<ReactNode>;
    children: ReactNode;
    icon?: IconName;
    itemType?: ItemType;
    label: string;
};

function getValueContainerElement(value: ReactNode): 'div' | 'pre' | 'p' {
    if (typeof value === 'string') {
        if (value.includes('\n')) {
            return 'pre';
        } else {
            return 'p';
        }
    }
    return 'div';
}

export const ValueControl: VFC<Props> = ({ actions, children, icon, itemType, label }) => {
    const ValueContainer = getValueContainerElement(children);

    return (
        <InputGroup
            icon={icon && <Icon name={icon} size={24} style={{ color: 'var(--field-placeholder-color)' }} />}
            actions={actions}
            actionsContainerClassName={itemType ? itemTypeToItemClassName[itemType] : undefined}
        >
            <span className="color-weak text-normal text-rg mb-1">{label}</span>
            <div className="color-norm text-normal text-rg">
                <ValueContainer className="m0">{children}</ValueContainer>
            </div>
        </InputGroup>
    );
};
