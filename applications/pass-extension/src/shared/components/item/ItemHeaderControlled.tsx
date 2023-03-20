import { ComponentPropsWithoutRef, FC, useEffect, useRef } from 'react';

import { Icon } from '@proton/components';
import { ItemType } from '@proton/pass/types';

import { itemTypeToIconName } from '../../items/icons';

import './ItemHeaderControlled.scss';

export const ItemHeaderControlled: FC<{
    type: ItemType;
    inputProps: ComponentPropsWithoutRef<'input'>;
}> = ({ type, inputProps }) => {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const icon = itemTypeToIconName[type];

    useEffect(() => nameInputRef.current?.select(), []);

    return (
        <div className="flex">
            <Icon className="mr0-5" name={icon} size={24} style={{ marginTop: 3 }} color="danger" />
            <input
                ref={nameInputRef}
                className="item-name--input text-2xl text-bold flex-item-fluid"
                spellCheck={false}
                autoComplete={'off'}
                {...inputProps}
            />
        </div>
    );
};
