import type { FC, ReactNode } from 'react';

import { Icon, DropdownMenuButton as _DropdownMenuButton } from '@proton/components';

interface Props {
    children: ReactNode;
    isSelected?: boolean;
    onClick: () => void;
}

export const DropdownMenuButton: FC<Props> = ({ children, isSelected, onClick }) => (
    <_DropdownMenuButton className="flex text-left text-sm" onClick={onClick}>
        {children}
        {isSelected && <Icon className="mlauto" name="checkmark" color="var(--interaction-norm-major-1)" />}
    </_DropdownMenuButton>
);
