import { type VFC, useMemo } from 'react';

import { c } from 'ttag';

import {
    Dropdown,
    DropdownButton,
    DropdownMenu,
    DropdownProps,
    Icon,
    IconName,
    usePopperAnchor,
} from '@proton/components';

import type { ItemsFilterOption } from '../../../../popup/context/items/ItemsFilteringContext';
import { itemTypeToIconName } from '../../../../shared/items';
import { DropdownMenuButton } from '../../../components/Dropdown/DropdownMenuButton';
import { useItems } from '../../../hooks/useItems';

interface ItemsFilterProps {
    value: ItemsFilterOption;
    onChange: (value: ItemsFilterOption) => void;
}

const DROPDOWN_SIZE: DropdownProps['size'] = { width: '11rem' };

const optionsWithoutCount: { [key in ItemsFilterOption]: { label: string; icon: IconName } } = {
    '*': {
        label: c('Label').t`All`,
        icon: 'grid-2',
    },
    alias: {
        label: c('Label').t`Aliases`,
        icon: itemTypeToIconName.alias,
    },
    login: {
        label: c('Label').t`Logins`,
        icon: itemTypeToIconName.login,
    },
    note: {
        label: c('Label').t`Notes`,
        icon: itemTypeToIconName.note,
    },
};

export const ItemsFilter: VFC<ItemsFilterProps> = ({ value, onChange }) => {
    const { anchorRef, isOpen, close, toggle } = usePopperAnchor<HTMLButtonElement>();
    const { matched } = useItems();

    const options = useMemo(
        () =>
            Object.entries(optionsWithoutCount).map(([type, { label, icon }]) => ({
                type: type as ItemsFilterOption,
                label,
                icon,
                count: type === '*' ? matched.length : matched.filter((item) => item.data.type === type).length,
            })),
        [matched]
    );

    const selectedOption = options.find(({ type }) => type === value)!;

    return (
        <>
            <DropdownButton
                hasCaret
                icon
                className="flex text-sm text-semibold mr0-25"
                onClick={toggle}
                ref={anchorRef}
                color="norm"
                shape="ghost"
                size="small"
            >
                <Icon name={selectedOption.icon} className="inline mr0-25" />
                {`${selectedOption.label} (${selectedOption.count})`}
            </DropdownButton>

            <Dropdown
                anchorRef={anchorRef}
                isOpen={isOpen}
                onClose={close}
                originalPlacement="bottom-start"
                size={DROPDOWN_SIZE}
            >
                <DropdownMenu>
                    {options.map(({ type, count, label, icon }) => (
                        <DropdownMenuButton key={type} onClick={() => onChange(type)} isSelected={type === value}>
                            <Icon className="mr0-5 text-weak" name={icon} />
                            {`${label} (${count})`}
                        </DropdownMenuButton>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </>
    );
};
