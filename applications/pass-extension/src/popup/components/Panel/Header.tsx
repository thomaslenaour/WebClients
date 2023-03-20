import type { ReactNode, VFC } from 'react';

import { Icon, IconName } from '@proton/components';
import clsx from '@proton/utils/clsx';

import './Header.scss';

type Props = {
    className?: string;
    title?: string;
    subtitle?: string;
    subtitleIcon?: IconName;
    actions?: ReactNode[];
};

export const PanelHeader: VFC<Props> = ({ className, actions, ...props }) => {
    const title = 'title' in props ? props.title : undefined;
    const subtitle = 'subtitle' in props ? props.subtitle : undefined;
    const subtitleIcon = 'subtitleIcon' in props ? props.subtitleIcon : undefined;

    const withActions = Array.isArray(actions) && actions.length > 0;
    const onlyActions = withActions && [title, subtitle].every((prop) => prop === undefined);

    return (
        <header className={clsx('flex flex-nowrap flex-justify-space-between flex-align-items-center', className)}>
            {title !== undefined && (
                <div>
                    <h2 className="text-2xl text-bold text-ellipsis">{title}</h2>
                    {subtitle !== undefined && (
                        <em className="flex flex-align-items-center color-weak">
                            {subtitleIcon && <Icon name={subtitleIcon} className="m-1" />}
                            {subtitle}
                        </em>
                    )}
                </div>
            )}
            {withActions && (
                <div
                    className={clsx(
                        onlyActions && 'flex flex-nowrap flex-justify-space-between flex-align-items-center w100'
                    )}
                >
                    {actions}
                </div>
            )}
        </header>
    );
};
