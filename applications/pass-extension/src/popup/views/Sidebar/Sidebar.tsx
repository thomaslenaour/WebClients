import type { FC } from 'react';

import './Sidebar.scss';

export const Sidebar: FC = ({ children }) => {
    return <div id="sidebar">{children}</div>;
};
