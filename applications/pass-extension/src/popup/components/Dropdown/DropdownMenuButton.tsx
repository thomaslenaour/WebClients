import type { FC, MouseEvent, ReactNode, RefObject } from 'react';

import { Dropdown, DropdownMenu, Icon, usePopperAnchor } from '@proton/components';
import {
    default as _DropdownMenuButton,
    Props as _DropdownMenuButtonProps,
} from '@proton/components/components/dropdown/DropdownMenuButton';
import clsx from '@proton/utils/clsx';

const QuickActionsDropdown: FC<{ children: ReactNode }> = ({ children }) => {
    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLElement>();

    const handleClick = (evt: MouseEvent) => {
        evt.stopPropagation();
        toggle();
    };

    return (
        <>
            <Icon
                color="color-weak"
                name="three-dots-vertical"
                onClick={handleClick}
                ref={anchorRef as unknown as RefObject<SVGSVGElement>}
            />

            <Dropdown isOpen={isOpen} anchorRef={anchorRef} onClose={close}>
                <DropdownMenu>{children}</DropdownMenu>
            </Dropdown>
        </>
    );
};

type Size = 'small' | 'medium';

interface DropdownMenuButtonProps extends _DropdownMenuButtonProps {
    children: ReactNode;
    className?: string;
    isSelected?: boolean;
    quickActions?: ReactNode;
    size?: Size;
}

export const DropdownMenuButton: FC<DropdownMenuButtonProps> = ({
    children,
    className,
    isSelected,
    quickActions,
    size = 'medium',
    ...rest
}) => (
    <_DropdownMenuButton
        className={clsx(
            'flex flex-align-items-center flex-nowrap flex-justify-space-between text-left',
            size === 'small' && 'text-sm py-2 px-4',
            className
        )}
        {...rest}
    >
        <div className="flex flex-align-items-center flex-nowrap">{children}</div>
        <div className="flex flex-align-items-center flex-item-noshrink">
            {isSelected && <Icon className="mlauto" name="checkmark" color="var(--interaction-norm-major-1)" />}
            {quickActions && <QuickActionsDropdown>{quickActions}</QuickActionsDropdown>}
        </div>
    </_DropdownMenuButton>
);
