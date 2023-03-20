import { FC } from 'react';
import { Helmet } from 'react-helmet';

import extensionLogo from '../../../../public/assets/protonpass-icon.svg';

export const ExtensionHead: FC<{ title: string }> = ({ title }) => {
    return (
        <Helmet>
            <link rel="icon" href={extensionLogo} type="image/svg+xml" />
            <title>{title}</title>
        </Helmet>
    );
};
