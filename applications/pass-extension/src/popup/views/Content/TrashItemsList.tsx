import { FC, useRef } from 'react';
import { List } from 'react-virtualized';

import { c } from 'ttag';

import { ContentVirtualList } from '../../../shared/components/content/ContentVirtualList';
import ItemListItem from '../../../shared/components/item/ItemListItem';
import { ListItemLink } from '../../../shared/components/router';
import { useNavigationContext } from '../../context';
import { useTrashedItems } from '../../hooks/useTrashedItems';

export const TrashItemsList: FC = () => {
    const { selectedItem, selectItem } = useNavigationContext();
    const items = useTrashedItems();
    const listRef = useRef<List>(null);

    return items.length === 0 ? (
        <div className="absolute-center flex flex-justify-center flex-align-items-center w70">
            <span className="block text-break color-weak text-sm p0-5 text-center">
                <>{c('Info').t`Empty trash`}</>
            </span>
        </div>
    ) : (
        <ContentVirtualList
            ref={listRef}
            rowCount={items.length}
            rowRenderer={({ style, index }) => {
                const item = { ...items[index], optimistic: false, failed: false };
                return (
                    <div style={style} className="px0-75" key={item.itemId}>
                        <ItemListItem
                            item={item}
                            id={`item-${item.shareId}-${item.itemId}`}
                            component={ListItemLink}
                            onClick={(evt) => {
                                evt.preventDefault();
                                selectItem(item.shareId, item.itemId, { inTrash: true });
                            }}
                            active={selectedItem?.itemId === item.itemId && selectedItem.shareId === item.shareId}
                        />
                    </div>
                );
            }}
        />
    );
};
