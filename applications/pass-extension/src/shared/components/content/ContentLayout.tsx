import type { FC } from 'react';

import './ContentLayout.scss';

export const ContentLayout: FC = ({ children }) => (
    <div id="content-layout" className="flex-item-fluid relative">
        {children}
    </div>
);
