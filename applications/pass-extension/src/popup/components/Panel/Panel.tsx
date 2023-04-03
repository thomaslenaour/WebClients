import type { ReactNode, VFC } from 'react';

import './Panel.scss';

export const Panel: VFC<{ header?: ReactNode; children?: ReactNode }> = ({ header, children }) => {
    return (
        <article className="pass-panel">
            {header && <div className="mb-3">{header}</div>}
            {children}
        </article>
    );
};
