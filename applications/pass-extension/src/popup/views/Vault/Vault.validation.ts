import type { FormikErrors } from 'formik';
import { c } from 'ttag';

import { isEmptyString } from '@proton/pass/utils/string';

import { VaultFormValues } from './Vault.form';

export const validateVaultValues = async ({ name }: VaultFormValues) => {
    let errors: FormikErrors<VaultFormValues> = {};
    if (isEmptyString(name)) {
        errors.name = c('Warning').t`Vault name is required`;
    }

    return errors;
};
