import { FC, useRef } from 'react';
import { List } from 'react-virtualized';

import { c } from 'ttag';

import { ContentVirtualList } from '../../../shared/components/content/ContentVirtualList';
import { ListItemLink } from '../../../shared/components/router';
import ItemListItem from '../../components/Item/ItemListItem';
import { useNavigationContext } from '../../context';
import { useItems } from '../../hooks/useItems';

export const TrashItemsList: FC = () => {
    const { selectedItem, selectItem } = useNavigationContext();
    const { matchedTrash: items } = useItems();
    const listRef = useRef<List>(null);

    return items.length === 0 ? (
        <div className="absolute-center flex flex-column flex-align-items-center">
            <h6 className="text-bold">{c('Title').t`Trash empty`}</h6>
            <span className="block color-weak">{c('Info').t`Deleted items will be moved here first`}</span>
        </div>
    ) : (
        <ContentVirtualList
            ref={listRef}
            rowCount={items.length}
            rowRenderer={({ style, index }) => {
                const item = items[index];
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
