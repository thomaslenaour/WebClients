import type { ReactNode, VFC } from 'react';

import { Icon, type IconName } from '@proton/components';
import type { ItemType, MaybeArray } from '@proton/pass/types';
import clsx from '@proton/utils/clsx';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { InputGroup } from './InputGroup';

import './ValueControl.scss';

type ContainerElement = 'div' | 'pre' | 'p' | 'ul';

type Props = {
    actions?: MaybeArray<ReactNode>;
    as?: ContainerElement;
    children: ReactNode;
    icon?: IconName;
    interactive?: boolean;
    itemType?: ItemType;
    label: string;
};

export const ValueControl: VFC<Props> = ({
    actions,
    as = 'div',
    children,
    icon,
    interactive = false,
    itemType,
    label,
}) => {
    const ValueContainer = as;

    return (
        <div className={clsx(interactive && 'pass-value-control--interactive')}>
            <InputGroup
                icon={icon && <Icon name={icon} size={24} style={{ color: 'var(--fieldset-cluster-icon-color)' }} />}
                actions={actions}
                actionsContainerClassName={itemType ? itemTypeToItemClassName[itemType] : undefined}
            >
                <span className="color-weak text-sm mb-1">{label}</span>
                <ValueContainer className="m-0 p-0">{children}</ValueContainer>
            </InputGroup>
        </div>
    );
};
