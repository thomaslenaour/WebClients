import React, { ComponentProps } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Icon, SettingsLink } from '@proton/components/components';
import clsx from '@proton/utils/clsx';

import './AccountSecurityCard.scss';

interface Props {
    state: 'warning' | 'critical';
    title: string;
    path: ComponentProps<typeof SettingsLink>['path'];
    description?: string;
    isDismissible?: boolean;
    className?: string;
    onDismiss?: () => void;
}

const AccountSecurityCard = ({ state, title, description, isDismissible, path, className, onDismiss }: Props) => {
    const iconColorClass = state === 'warning' ? 'color-warning' : 'color-danger';
    const iconBgColorClass = state === 'warning' ? 'security-card-icon-warning' : 'security-card-icon-danger';
    // Translator: "Warning" and "Important note" are alternatives for some icons (for blind users)
    const iconAltText = state === 'warning' ? c('Info').t`Warning` : c('Info').t`Important note`;

    return (
        <div className="group-hover-opacity-container security-card-container relative">
            <SettingsLink
                className={clsx(
                    'drawerAppSection security-card-button text-no-decoration color-norm hover:color-norm block w-full px-4 py-3 rounded-lg shadow-norm',
                    className
                )}
                path={path}
            >
                <span className="flex flex-nowrap items-start">
                    <span className={clsx('ratio-square rounded flex security-card-icon-container', iconBgColorClass)}>
                        <Icon name="exclamation-filled" className={clsx('m-auto', iconColorClass)} alt={iconAltText} />
                    </span>
                    <span className="flex-1 text-left pl-2 pr-1">
                        <span className="block">{title}</span>
                        {description && <span className="block m-0 text-sm color-weak">{description}</span>}
                    </span>
                    <span className="flex-0 flex self-stretch color-weak">
                        <Icon name="chevron-right" className="my-auto group-hover:opacity-100" />
                    </span>
                </span>
            </SettingsLink>
            {isDismissible && (
                <Button
                    icon
                    className="security-card-dismiss-button absolute top-0 left-0 shadow-norm rounded-full group-hover:opacity-100"
                    title={c('Action').t`Dismiss`}
                    onClick={onDismiss}
                >
                    <Icon name="cross" className="my-auto" alt={c('Action').t`Dismiss`} />
                </Button>
            )}
        </div>
    );
};

export default AccountSecurityCard;
