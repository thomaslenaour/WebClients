import { type VFC, memo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, InputTwo } from '@proton/components/components';
import { selectShare } from '@proton/pass/store';
import { ShareType } from '@proton/pass/types';

import { useItemsFilteringContext } from '../../context/items/useItemsFilteringContext';
import { useNavigationContext } from '../../context/navigation/useNavigationContext';

import './Searchbar.scss';

/**
 * FIXME: if we get reports of the search ever feeling slow or sluggish,
 * we might have to either debounce the search query value handling and/or
 * to implement the component as a an uncontroller input.
 */
const SearchbarRaw: VFC<{ disabled?: boolean; value: string; handleValue: (value: string) => void }> = ({
    disabled,
    value,
    handleValue,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { inTrash } = useNavigationContext();
    const { shareId } = useItemsFilteringContext();

    const vault = useSelector(selectShare<ShareType.Vault>(shareId));
    const placeholder = vault
        ? c('Placeholder').t`Search in ${vault.content.name}`
        : c('Placeholder').t`Search in all vaults`;

    const handleClear = () => {
        handleValue('');
        inputRef.current?.focus();
    };

    return (
        <InputTwo
            ref={inputRef}
            className="pass-searchbar"
            placeholder={`${inTrash ? c('Placeholder').t`Search in Trash` : placeholder}…
`}
            prefix={<Icon name="magnifier" />}
            suffix={
                value !== '' && (
                    <Button
                        shape="ghost"
                        size="small"
                        color="weak"
                        icon
                        pill
                        onClick={handleClear}
                        title={c('Action').t`Clear search`}
                    >
                        <Icon name="cross" />
                    </Button>
                )
            }
            value={value}
            onValue={handleValue}
            disabled={disabled}
            autoFocus
        />
    );
};

export const Searchbar = memo(SearchbarRaw);
