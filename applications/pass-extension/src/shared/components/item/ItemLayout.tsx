import { ReactNode } from 'react';

import { Scroll } from '@proton/atoms';

import './ItemLayout.scss';

interface ItemLayoutProps {
    header?: ReactNode;
    main?: ReactNode;
    actions?: ReactNode;
}

export const ItemLayout = ({ header, main, actions }: ItemLayoutProps) => {
    return (
        <div className="item-new-layout bg-weak">
            <div className="py1 px1-5">{header}</div>
            <Scroll className="overflow-hidden scroll-overlay">
                <div className="py0-75 px1-5">{main}</div>
            </Scroll>
            <div className="p0-75 border-top min-h-custom" style={{ '--min-height-custom': '58px' }}>
                {actions}
            </div>
        </div>
    );
};
