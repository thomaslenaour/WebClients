import React, { ReactNode } from 'react';

import { Scroll } from '@proton/atoms';
import { DropdownMenu } from '@proton/components/components';
import { pixelEncoder } from '@proton/pass/utils/dom';

const MAX_ITEMS_ON_SCREEN = 3;
const MAX_SCROLL_HEIGHT = MAX_ITEMS_ON_SCREEN * 60;

export const DropdownItemsList: React.FC<{ children: ReactNode | ReactNode[] }> = ({ children }) => {
    return (
        <DropdownMenu>
            <div
                className="max-h-custom overflow-hidden"
                style={{ '--max-height-custom': pixelEncoder(MAX_SCROLL_HEIGHT) }}
            >
                <Scroll
                    {...(Array.isArray(children) && children.length > MAX_ITEMS_ON_SCREEN
                        ? { style: { height: MAX_SCROLL_HEIGHT } }
                        : {})}
                >
                    {children}
                </Scroll>
            </div>
        </DropdownMenu>
    );
};
