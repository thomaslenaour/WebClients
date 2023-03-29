import type { ReactNode, VFC } from 'react';

import { Icon, type IconName } from '@proton/components';
import type { ItemType, MaybeArray } from '@proton/pass/types';
import clsx from '@proton/utils/clsx';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { InputGroup } from './InputGroup';

import './ValueControl.scss';

type Props = {
    actions?: MaybeArray<ReactNode>;
    children: ReactNode;
    icon?: IconName;
    itemType?: ItemType;
    label: string;
    onClick?: () => void;
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

export const ValueControl: VFC<Props> = ({ actions, children, icon, itemType, label, onClick }) => {
    const ValueContainer = getValueContainerElement(children);

    return (
        <div onClick={onClick} className={clsx(!!onClick && 'pass-value-control--clickable')}>
            <InputGroup
                icon={icon && <Icon name={icon} size={24} style={{ color: 'var(--field-placeholder-color)' }} />}
                actions={actions}
                actionsContainerClassName={itemType ? itemTypeToItemClassName[itemType] : undefined}
            >
                <span className="color-weak text-sm mb-1">{label}</span>
                <ValueContainer className="m0">{children}</ValueContainer>
            </InputGroup>
        </div>
    );
};
