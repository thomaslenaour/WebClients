import { FC } from 'react';

import { Field } from 'formik';
import { c } from 'ttag';

import { TextAreaField, TextField } from '../fields';

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
