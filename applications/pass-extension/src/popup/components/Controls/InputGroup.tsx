import type { FC, ReactNode } from 'react';

import clsx from '@proton/utils/clsx';

import './InputGroup.scss';

type Props = {
    actions?: ReactNode | ReactNode[];
    actionsContainerClassName?: string;
    icon?: ReactNode;
};

export const InputGroup: FC<Props> = ({ actions, actionsContainerClassName, children, icon }) => {
    return (
        <div className="flex flex-nowrap flex-align-items-center px-4 py-3 pass-input-group">
            {icon && <span className="flex flex-justify-center flex-align-items-center pr-4">{icon}</span>}

            <div className="w100">{children}</div>

            {actions && <span className={clsx('flex-item-noshrink', actionsContainerClassName)}>{actions}</span>}
        </div>
    );
};
