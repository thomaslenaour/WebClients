import { ForwardRefRenderFunction, forwardRef, useCallback, useState } from 'react';
import { AutoSizer, List, ListRowRenderer, ScrollParams } from 'react-virtualized';

import clsx from '@proton/utils/clsx';

type ContentVirtualListProps = {
    rowRenderer: ListRowRenderer;
    rowCount: number;
};

const ContentVirtualListRender: ForwardRefRenderFunction<List, ContentVirtualListProps> = (
    { rowRenderer, rowCount },
    virtualListRef
) => {
    const [shadows, setShadows] = useState({ top: false, bottom: false });

    const handleScroll = useCallback(({ scrollTop, clientHeight, scrollHeight }: ScrollParams) => {
        const scrollable = clientHeight > 0 && scrollHeight > clientHeight;

        setShadows({
            top: scrollable && scrollTop > 0 && scrollHeight > clientHeight,
            bottom: scrollable && scrollTop + clientHeight < scrollHeight,
        });
    }, []);

    return (
        <div className="h100 scroll-outer-vertical">
            <div
                className={clsx('scroll-start-shadow no-pointer-events', shadows.top && 'scroll-start-shadow-visible')}
                aria-hidden="true"
            />
            <div
                className={clsx('scroll-end-shadow no-pointer-events', shadows.bottom && 'scroll-end-shadow-visible')}
                aria-hidden="true"
            />

            <AutoSizer>
                {({ height, width }) => (
                    <List
                        className="outline-none unstyled m0"
                        style={{ overflowY: 'overlay' }}
                        ref={virtualListRef}
                        onScroll={handleScroll}
                        onScrollbarPresenceChange={({ vertical }) => setShadows({ top: false, bottom: vertical })}
                        rowRenderer={rowRenderer}
                        rowCount={rowCount}
                        height={height}
                        width={width - 1} /* account for react-virtualized ceiling */
                        rowHeight={52}
                    />
                )}
            </AutoSizer>
        </div>
    );
};

export const ContentVirtualList = forwardRef(ContentVirtualListRender);
