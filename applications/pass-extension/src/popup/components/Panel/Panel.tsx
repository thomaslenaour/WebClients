import type { ReactNode, VFC } from 'react';

import clsx from '@proton/utils/clsx';

import './Panel.scss';

type Props = {
    header?: ReactNode;
    children?: ReactNode;
    className?: string;
};

export const Panel: VFC<Props> = ({ header, children, className }) => {
    return (
        <article className={clsx('pass-panel', className)}>
            {header && <div className="mb-3">{header}</div>}
            {children}
        </article>
    );
};
