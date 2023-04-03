import type { ReactNode, VFC } from 'react';

import { Icon, type IconName } from '@proton/components';
import type { ItemType, MaybeArray } from '@proton/pass/types';
import clsx from '@proton/utils/clsx';

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

export const ValueControl: VFC<Props> = ({ actions, as = 'div', children, icon, interactive = false, label }) => {
    const ValueContainer = as;

    return (
        <div className={clsx(interactive && 'pass-value-control--interactive')}>
            <InputGroup
                icon={icon && <Icon name={icon} size={24} style={{ color: 'var(--fieldset-cluster-icon-color)' }} />}
                actions={actions}
            >
                <div className="color-weak text-ellipsis text-sm">{label}</div>
                <ValueContainer className="pass-value-control--value m-0 p-0 text-ellipsis">{children}</ValueContainer>
            </InputGroup>
        </div>
    );
};
