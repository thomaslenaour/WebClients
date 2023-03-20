import type { FC } from 'react';

import './ContentLayout.scss';

export const ContentLayout: FC = ({ children }) => (
    <div id="content-layout">
        <div className="flex-item-fluid relative">{children}</div>
    </div>
);
