import type { FC } from 'react';

import { Field } from 'formik';
import { c } from 'ttag';

import { TextAreaField, TextField } from '../../../shared/components/fields';

export type VaultFormValues = { name: string; description: string };
export type VaultFormHandle = { submit: () => void };

export const VaultForm: FC = () => {
    return (
        <>
            <Field
                name="name"
                label={c('Label').t`Vault name`}
                placeholder={c('Placeholder').t`Enter email or username`}
                component={TextField}
            />

            <Field name="description" label={c('Label').t`Description`} component={TextAreaField} rows={5} />
        </>
    );
};
