import type { MouseEvent, VFC } from 'react';
import { useHistory } from 'react-router-dom';

import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import {
    Dropdown,
    DropdownMenu,
    DropdownMenuButton,
    Header as HeaderComponent,
    Icon,
    Tooltip,
    useNotifications,
    usePopperAnchor,
} from '@proton/components';
import type { ItemType } from '@proton/pass/types';
import { pipe } from '@proton/pass/utils/fp';
import { textToClipboard } from '@proton/shared/lib/helpers/browser';

import { itemTypeToIconName } from '../../../shared/items';
import { itemTypeToItemClassName } from '../../../shared/items/className';
import { usePopupContext } from '../../context';
import { useItemsFilteringContext } from '../../context/items/useItemsFilteringContext';
import { usePasswordGeneratorContext } from '../PasswordGenerator/PasswordGeneratorContext';
import { MenuDropdown } from './MenuDropdown';
import { Searchbar } from './Searchbar';

const ITEM_TYPE_DROPDOWN_BUTTONS = [
    {
        label: c('Label').t`Login`,
        type: 'login' as const,
    },
    {
        label: c('Label').t`Alias`,
        type: 'alias' as const,
    },
    {
        label: c('Label').t`Note`,
        type: 'note' as const,
    },
];

export const Header: VFC<{}> = () => {
    const history = useHistory();
    const { ready } = usePopupContext();
    const { search, setSearch } = useItemsFilteringContext();
    const { createNotification } = useNotifications();
    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLButtonElement>();
    const { generatePassword } = usePasswordGeneratorContext();
    const withClose = <T extends (...args: any[]) => void>(action: T) => pipe(action, close) as T;

    const handleNewItemClick = (type: ItemType) => {
        // Trick to be able to return to the initial route using history.goBack() if user switches
        // from iteam creation routes for multiple subsequent item types.
        const shouldReplace = history.location.pathname.includes('/item/new/');
        history[shouldReplace ? 'replace' : 'push'](`/item/new/${type}`);
    };

    const handleNewPasswordClick = (e: MouseEvent<HTMLElement>) => {
        void generatePassword({
            actionLabel: c('Action').t`Copy & close`,
            className: 'ui-password',
            onSubmit: (password) => {
                textToClipboard(password, e.currentTarget);
                createNotification({ type: 'success', text: c('Info').t`Copied to clipboard` });
            },
        });
    };

    return (
        <>
            <HeaderComponent className="flex-align-items-center gap-2 p-2 border-bottom hauto">
                <MenuDropdown />
                <Searchbar disabled={!ready} value={search} handleValue={setSearch} />
                <div>
                    <Tooltip title={c('Action').t`Add new item`}>
                        <Button icon pill color="norm" disabled={!ready} onClick={toggle} ref={anchorRef}>
                            <Icon name="plus" />
                        </Button>
                    </Tooltip>
                </div>

                <Dropdown
                    isOpen={isOpen}
                    anchorRef={anchorRef}
                    autoClose={false}
                    onClose={close}
                    originalPlacement="bottom-start"
                >
                    <DropdownMenu>
                        {ITEM_TYPE_DROPDOWN_BUTTONS.map(({ type, label }) => (
                            <span className={itemTypeToItemClassName[type]} key={`item-type-dropdown-button-${type}`}>
                                <DropdownMenuButton
                                    key={type}
                                    className="text-left flex flex-align-items-center"
                                    onClick={withClose(() => handleNewItemClick(type))}
                                >
                                    <span
                                        className="mr-4 w-custom h-custom rounded-50 overflow-hidden relative pass-item-icon"
                                        style={{ '--width-custom': `2em`, '--height-custom': `2em` }}
                                    >
                                        <Icon
                                            name={itemTypeToIconName[type]}
                                            className="absolute-center"
                                            color="var(--interaction-norm)"
                                        />
                                    </span>

                                    {label}
                                </DropdownMenuButton>
                            </span>
                        ))}

                        <DropdownMenuButton
                            className="text-left flex flex-align-items-center ui-password"
                            onClick={withClose(handleNewPasswordClick)}
                        >
                            <span
                                className="mr-4 w-custom h-custom rounded-50 overflow-hidden relative pass-item-icon"
                                style={{ '--width-custom': `2em`, '--height-custom': `2em` }}
                            >
                                <Icon name="key" className="absolute-center" color="var(--interaction-norm)" />
                            </span>

                            {c('Label').t`Password`}
                        </DropdownMenuButton>
                    </DropdownMenu>
                </Dropdown>
            </HeaderComponent>
        </>
    );
};
