import { FC } from 'react';

import { c } from 'ttag';

import { Card } from '@proton/atoms/Card';
import { Icon } from '@proton/components';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { Exporter } from '../../../shared/components/export';

export const Export: FC = () => {
    return (
        <>
            <Card rounded className="mb1">
                {c('Info')
                    .t`In order to securely export your ${PASS_APP_NAME} data, please choose a strong password to protect your export.`}
                <hr className="my0-5" />
                <Icon name="exclamation-circle" className="mr0-25" />
                <small>
                    <strong>{c('Info').t`Email aliases will not be exported`}</strong>
                </small>
            </Card>
            <Exporter />
        </>
    );
};
