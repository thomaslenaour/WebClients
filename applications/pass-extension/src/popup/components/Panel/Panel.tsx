import type { ReactNode, VFC } from 'react';

import './Panel.scss';

export const Panel: VFC<{ header?: ReactNode; children?: ReactNode }> = ({ header, children }) => {
    return (
        <article className="pass-panel">
            {header && <div style={{ marginBottom: '1rem' }}>{header}</div>}
            {children}
        </article>
    );
};
