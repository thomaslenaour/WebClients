import { FormikErrors } from 'formik';
import { c } from 'ttag';

import { isEmptyString } from '@proton/pass/utils/string';

type NoteFormValues = {
    name: string;
    note: string;
};

export const validateNoteForm = (values: NoteFormValues): FormikErrors<NoteFormValues> => {
    const errors: FormikErrors<NoteFormValues> = {};

    if (isEmptyString(values.name)) {
        errors.name = c('Warning').t`Item name cannot be empty`;
    }

    return errors;
};
