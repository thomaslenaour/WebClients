import type { FC, ReactNode } from 'react';

import type { MaybeArray } from '@proton/pass/types';
import clsx from '@proton/utils/clsx';

import './InputGroup.scss';

export type Props = {
    actions?: MaybeArray<ReactNode>;
    actionsContainerClassName?: string;
    icon?: ReactNode;
    className?: string;
};

export const BaseInputGroup: FC<Props> = ({ className, actions, actionsContainerClassName, children, icon }) => {
    return (
        <div className={clsx('flex flex-nowrap flex-align-items-center pass-input-group', className)}>
            {icon && <span className="flex flex-justify-center flex-align-items-center pr-4">{icon}</span>}

            <div className="w100">{children}</div>

            {actions && <span className={clsx('flex-item-noshrink', actionsContainerClassName)}>{actions}</span>}
        </div>
    );
};

export const InputGroup: FC<Props> = (props) => {
    return <BaseInputGroup {...props} className={clsx(props.className, 'px-4 py-3')} />;
};
