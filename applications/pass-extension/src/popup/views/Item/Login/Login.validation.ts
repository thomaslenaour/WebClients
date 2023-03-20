import { FormikErrors } from 'formik';
import { c } from 'ttag';

import { isEmptyString } from '@proton/pass/utils/string';

import { UrlGroupValues, validateUrl, validateUrls } from '../../../../shared/components/fields';
import { AliasFormValues, validateAliasForm } from '../Alias/Alias.validation';

type BaseLoginItemFormValues = {
    name: string;
    shareId: string;
    username: string;
    password: string;
    note: string;
} & UrlGroupValues;

export type NewLoginItemFormValues =
    | ({ withAlias: false } & BaseLoginItemFormValues)
    | ({ withAlias: true } & BaseLoginItemFormValues & AliasFormValues);

export type EditLoginItemFormValues = BaseLoginItemFormValues;

const validateLoginFormBase = (
    values: NewLoginItemFormValues | EditLoginItemFormValues
): FormikErrors<NewLoginItemFormValues | EditLoginItemFormValues> => {
    const errors: FormikErrors<NewLoginItemFormValues | EditLoginItemFormValues> = {};

    if (isEmptyString(values.name)) {
        errors.name = c('Warning').t`Name is required`;
    }

    const urlError = validateUrl(values);
    const urlsErrors = validateUrls(values);

    return {
        ...errors,
        ...urlError,
        ...urlsErrors,
    };
};

export const validateNewLoginForm = (values: NewLoginItemFormValues): FormikErrors<NewLoginItemFormValues> => {
    const errors: FormikErrors<NewLoginItemFormValues> = validateLoginFormBase(values);

    const aliasErrors = values.withAlias ? validateAliasForm({ ...values, aliasPrefix: values.username }) : {};

    if (aliasErrors.aliasPrefix) {
        errors.username = c('Warning').t`Username from created alias is invalid`;
    }

    return {
        ...errors,
        ...aliasErrors,
    };
};

export const validateEditLoginForm = (values: EditLoginItemFormValues): FormikErrors<EditLoginItemFormValues> => {
    const errors: FormikErrors<NewLoginItemFormValues> = validateLoginFormBase(values);
    return errors;
};
