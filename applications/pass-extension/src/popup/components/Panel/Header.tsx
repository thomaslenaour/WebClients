import type { ReactNode, VFC } from 'react';

import { Icon, IconName } from '@proton/components';
import clsx from '@proton/utils/clsx';

import './Header.scss';

type Props = {
    className?: string;
    title: string;
    subtitle?: string;
    subtitleIcon?: IconName;
    actions?: ReactNode[];
};

export const PanelHeader: VFC<Props> = ({ className, title, subtitle, subtitleIcon, actions }) => {
    return (
        <header className={clsx('flex flex-nowrap flex-justify-space-between flex-align-items-center', className)}>
            <div>
                <h2 className="text-2xl text-bold text-ellipsis">{title}</h2>
                {subtitle && (
                    <em className="flex flex-align-items-center color-weak">
                        {subtitleIcon && <Icon name={subtitleIcon} style={{ marginRight: '0.25rem' }} />}
                        {subtitle}
                    </em>
                )}
            </div>
            {Array.isArray(actions) && actions.length > 0 && <div>{actions}</div>}
        </header>
    );
};
