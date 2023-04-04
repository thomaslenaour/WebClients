import { type VFC, useEffect, useMemo, useRef } from 'react';
import { List } from 'react-virtualized';

import { c } from 'ttag';

import { interpolateRecentItems } from '@proton/pass/utils/pass/items';

import { ContentVirtualList } from '../../../shared/components/content/ContentVirtualList';
import { ListItemLink } from '../../../shared/components/router';
import ItemListItem from '../../components/Item/ItemListItem';
import { useNavigationContext } from '../../context';
import { useItems } from '../../hooks/useItems';
import { ItemsFilter, ItemsSort } from './filters';

export const ContentItemsList: VFC = () => {
    const { selectItem, selectedItem } = useNavigationContext();
    const {
        filtering: { search, filter, sort, setSort, setFilter },
        filtered: filteredItems,
    } = useItems();

    const listRef = useRef<List>(null);
    useEffect(() => listRef.current?.scrollToRow(0), [filter, sort]);

    const { interpolation, interpolationIndexes } = useMemo(
        () => interpolateRecentItems(filteredItems)(sort === 'recent'),
        [filteredItems, sort]
    );

    return (
        <>
            <div className="flex px-3 py-2 gap-1">
                <ItemsFilter value={filter} onChange={setFilter} />
                <ItemsSort sort={sort} onSortChange={setSort} />
            </div>

            {filteredItems.length === 0 ? (
                <div className="absolute-center flex flex-justify-center flex-align-items-center w70">
                    <span className="block text-break color-weak text-sm p-2 text-center">
                        {search.trim() ? (
                            <>
                                {c('Warning').t`No items matching`}
                                <br />"{search}"
                            </>
                        ) : (
                            <>{c('Warning').t`No items`}</>
                        )}
                    </span>
                </div>
            ) : (
                <ContentVirtualList
                    ref={listRef}
                    rowCount={interpolation.length}
                    interpolationIndexes={interpolationIndexes}
                    rowRenderer={({ style, index }) => {
                        const row = interpolation[index];

                        switch (row.type) {
                            case 'entry': {
                                const item = row.entry;
                                return (
                                    <div style={style} key={item.itemId}>
                                        <ItemListItem
                                            item={item}
                                            component={ListItemLink}
                                            onClick={(evt) => {
                                                evt.preventDefault();
                                                selectItem(item.shareId, item.itemId);
                                            }}
                                            id={`item-${item.shareId}-${item.itemId}`}
                                            search={search}
                                            active={
                                                selectedItem?.itemId === item.itemId &&
                                                selectedItem?.shareId === item.shareId
                                            }
                                        />
                                    </div>
                                );
                            }
                            case 'interpolation': {
                                return (
                                    <div style={style} key={`divider-${index}`} className="flex color-weak pl-4">
                                        <span className="my-auto">{row.cluster.label}</span>
                                    </div>
                                );
                            }
                        }
                    }}
                />
            )}
        </>
    );
};
