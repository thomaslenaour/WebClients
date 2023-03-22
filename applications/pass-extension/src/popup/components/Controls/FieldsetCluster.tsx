import { type FC } from 'react';

import './FieldsetCluster.scss';

type Props = {
    as?: 'fieldset' | 'div' | 'span';
};

export const FieldsetCluster: FC<Props> = ({ children, as = 'fieldset' }) => {
    const Component = as;
    return (
        <Component
            className="pass-fieldset-cluster border-none rounded-xl p-0 m-0 mb-2"
            style={{ background: 'var(--field-norm)' }}
        >
            {children}
        </Component>
    );
};
