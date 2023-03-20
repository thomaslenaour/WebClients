import { FormikContextType, FormikErrors } from 'formik';
import { c } from 'ttag';

import { AliasMailbox } from '@proton/pass/types/data/alias';
import { isEmptyString } from '@proton/pass/utils/string';
import { validateLocalPart } from '@proton/shared/lib/helpers/email';

import { UseAliasOptionsConfig } from '../../../../shared/hooks';

export type AliasFormValues = {
    aliasPrefix?: string;
    aliasSuffix?: { signature: string; value: string };
    mailboxes: AliasMailbox[];
};

export type NewAliasFormValues = AliasFormValues & {
    name: string;
    note: string;
    shareId: string;
};

export type EditAliasFormValues = Pick<AliasFormValues, 'mailboxes'> & {
    name: string;
    note: string;
};

export type AliasFormProps<V> = {
    form: FormikContextType<V>;
    shareId: string;
    onAliasOptionsLoaded?: UseAliasOptionsConfig['onAliasOptionsLoaded'];
};

export const validateAliasForm = ({
    aliasPrefix,
    mailboxes,
    aliasSuffix,
}: AliasFormValues): FormikErrors<AliasFormValues> => {
    const errors: FormikErrors<AliasFormValues> = {};

    if (aliasPrefix === undefined || !validateLocalPart(aliasPrefix + (aliasSuffix?.value?.split('@')?.[0] ?? ''))) {
        errors.aliasPrefix = c('Warning').t`Invalid alias prefix`;
    }

    if (aliasSuffix === undefined) {
        errors.aliasSuffix = c('Warning').t`Missing alias suffix`;
    }

    if (mailboxes.length === 0) {
        errors.mailboxes = c('Warning').t`You must select at least one mailbox`;
    }

    return errors;
};

export const validateNewAliasForm = (values: NewAliasFormValues): FormikErrors<NewAliasFormValues> => {
    const errors: FormikErrors<NewAliasFormValues> = validateAliasForm(values);
    const { aliasPrefix, aliasSuffix, mailboxes } = values;

    if (isEmptyString(values.name)) {
        errors.name = c('Warning').t`Name is required`;
    }

    if (aliasPrefix === undefined || aliasPrefix.trim() === '') {
        errors.aliasPrefix = c('Warning').t`Missing alias prefix`;
    }

    if (aliasPrefix && !validateLocalPart(aliasPrefix + (aliasSuffix?.value?.split('@')?.[0] ?? ''))) {
        errors.aliasPrefix = c('Warning').t`Invalid alias prefix`;
    }

    if (aliasPrefix && !/^[a-z0-9\-\_.]*$/.test(aliasPrefix)) {
        errors.aliasPrefix = c('Warning').t`Only alphanumeric characters, dots, hyphens and underscores are allowed`;
    }

    if (aliasSuffix === undefined) {
        errors.aliasSuffix = c('Warning').t`Missing alias suffix`;
    }

    if (mailboxes.length === 0) {
        errors.mailboxes = c('Warning').t`You must select at least one mailbox`;
    }

    return errors;
};

export const validateEditAliasForm = ({ name, mailboxes }: EditAliasFormValues): FormikErrors<EditAliasFormValues> => {
    const errors: FormikErrors<EditAliasFormValues> = {};

    if (isEmptyString(name)) {
        errors.name = c('Warning').t`Name is required`;
    }

    if (mailboxes.length === 0) {
        errors.mailboxes = c('Warning').t`You must select at least one mailbox`;
    }

    return errors;
};
