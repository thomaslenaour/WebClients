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
        <header
            className={clsx(
                'flex flex-nowrap flex-justify-space-between flex-align-items-start gap-2',
                subtitle !== undefined ? 'flex-align-items-start' : 'flex-align-items-center',
                className
            )}
        >
            {title !== undefined && (
                <div>
                    <h2 className="text-2xl text-bold text-ellipsis lh100">{title}</h2>
                    {subtitle !== undefined && (
                        <em className="flex flex-align-items-center color-weak">
                            {subtitleIcon && <Icon name={subtitleIcon} className="m-1" />}
                            <span className="text-ellipsis flex-item-fluid">{subtitle}</span>
                        </em>
                    )}
                </div>
            )}
            {withActions && (
                <div
                    className={clsx(
                        'flex flex-nowrap flex-no-shrink flex-justify-space-between flex-align-items-center flex-item-noshrink gap-2',
                        onlyActions && 'w100'
                    )}
                >
                    {actions}
                </div>
            )}
        </header>
    );
};
