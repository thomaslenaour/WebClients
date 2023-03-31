import type { FormikErrors } from 'formik';
import { c } from 'ttag';

import { normalizeOtpUriFromUserInput } from '@proton/pass/utils/otp';
import { isEmptyString } from '@proton/pass/utils/string';

import { type UrlGroupValues, validateUrl, validateUrls } from '../../../components/Fields/UrlGroupFieldCluster';
import { type AliasFormValues, validateAliasForm } from '../Alias/Alias.validation';

type BaseLoginItemFormValues = {
    name: string;
    shareId: string;
    username: string;
    password: string;
    note: string;
    totpUri: string;
} & UrlGroupValues;

type MaybeWithAlias<WithAlias extends boolean, T extends {}> = WithAlias extends true
    ? T & { withAlias: true } & AliasFormValues
    : T & { withAlias: false };

export type LoginItemFormValues<WithAlias extends boolean = boolean> = MaybeWithAlias<
    WithAlias,
    BaseLoginItemFormValues
>;

export type EditLoginItemFormValues = LoginItemFormValues | BaseLoginItemFormValues;
export type NewLoginItemFormValues = LoginItemFormValues;

const validateTotpUri = (values: BaseLoginItemFormValues) => {
    if (!isEmptyString(values.totpUri)) {
        const normalized = normalizeOtpUriFromUserInput(values.totpUri);
        if (!normalized) {
            return { totpUri: c('Validation').t`OTP Secret or URI is invalid` };
        }
        return {};
    }
};

const validateLoginFormBase = (values: BaseLoginItemFormValues): FormikErrors<BaseLoginItemFormValues> => {
    const errors: FormikErrors<BaseLoginItemFormValues> = {};

    if (isEmptyString(values.name)) {
        errors.name = c('Warning').t`Title is required`;
    }

    const urlError = validateUrl(values);
    const urlsErrors = validateUrls(values);

    const totpUriErrors = validateTotpUri(values);

    return {
        ...errors,
        ...urlError,
        ...urlsErrors,
        ...totpUriErrors,
    };
};

export const validateNewLoginForm = (values: NewLoginItemFormValues): FormikErrors<NewLoginItemFormValues> => {
    const errors: FormikErrors<NewLoginItemFormValues> = validateLoginFormBase(values);
    const aliasErrors = values.withAlias && validateAliasForm(values);

    return {
        ...errors,
        ...aliasErrors,
    };
};

export const validateEditLoginForm = (values: EditLoginItemFormValues): FormikErrors<EditLoginItemFormValues> => {
    const errors: FormikErrors<EditLoginItemFormValues> = validateLoginFormBase(values);
    return errors;
};
