import { VFC, memo } from 'react';
import { Link, LinkProps } from 'react-router-dom';

import { ButtonLike, ButtonLikeProps } from '@proton/atoms/Button';
import { Marks } from '@proton/components/components';
import type { ItemRevisionWithOptimistic } from '@proton/pass/types';
import { isEmptyString } from '@proton/pass/utils/string';
import { escapeRegex, getMatches } from '@proton/shared/lib/helpers/regex';
import { normalize } from '@proton/shared/lib/helpers/string';
import clsx from '@proton/utils/clsx';

import { itemTypeToItemClassName } from '../../../shared/items/className';
import { presentListItem } from '../../items';
import { ItemIcon } from './ItemIcon';

import './ItemListItem.scss';

const getItemNameSearchChunks = (itemName: string, search: string) => {
    if (!search) {
        return [];
    }

    const regex = new RegExp(escapeRegex(normalize(search)), 'gi');
    return getMatches(regex, normalize(itemName));
};

type ItemListItemProps = Partial<LinkProps> &
    ButtonLikeProps<any> & {
        item: ItemRevisionWithOptimistic;
        search?: string;
        active?: boolean;
    };

const ItemListItem: VFC<ItemListItemProps> = ({ item, search = '', active = false, ...rest }) => {
    const { data, optimistic, failed } = item;
    const { heading, subheading } = presentListItem(item);

    return (
        <ButtonLike
            as={Link}
            to="#"
            className={clsx([
                'pass-item-list--item interactive-pseudo w100 relative',
                optimistic && !failed && 'opacity-50',
                active && 'is-active',
            ])}
            color={failed ? 'warning' : 'weak'}
            shape="ghost"
            {...rest}
        >
            <div className="flex-nowrap flex w100 px-3 py-2 flex-align-items-center">
                <ItemIcon
                    item={item}
                    size={36}
                    className={clsx('mr-3  flex-item-noshrink', itemTypeToItemClassName[data.type])}
                />
                <div className="text-left">
                    <span className="block text-ellipsis">
                        <Marks chunks={getItemNameSearchChunks(heading, search)}>{heading}</Marks>
                    </span>
                    <div
                        className={clsx([
                            'block color-weak text-sm text-ellipsis',
                            item.data.type === 'note' && isEmptyString(item.data.metadata.note) && 'text-italic',
                        ])}
                    >
                        <Marks chunks={getItemNameSearchChunks(subheading, search)}>{subheading}</Marks>
                    </div>
                </div>
            </div>
        </ButtonLike>
    );
};

export default memo(ItemListItem);
