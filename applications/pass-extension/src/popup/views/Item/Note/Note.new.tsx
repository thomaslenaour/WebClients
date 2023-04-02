import { type VFC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { getEpoch } from '@proton/pass/utils/time';

import { ItemNewProps } from '../../../../shared/items';
import { NoteTextAreaField, NoteTitleField } from '../../../components/Fields/Note/index';
import { ItemCreatePanel } from '../../../components/Panel/ItemCreatePanel';
import { VaultSelectField } from '../../../components/Vault/VaultSelectField';
import { NoteFormValues, validateNoteForm } from './Note.validation';

const FORM_ID = 'new-note';

export const NoteNew: VFC<ItemNewProps<'note'>> = ({ shareId, onSubmit, onCancel }) => {
    const initialValues: NoteFormValues = { name: '', note: '', shareId };

    const form = useFormik<NoteFormValues>({
        initialValues,
        initialErrors: validateNoteForm(initialValues),
        onSubmit: (values) => {
            const optimisticId = uniqid();

            onSubmit({
                type: 'note',
                optimisticId,
                shareId: values.shareId,
                createTime: getEpoch(),
                metadata: {
                    name: values.name,
                    note: values.note,
                    itemUuid: optimisticId,
                },
                content: {},
                extraFields: [],
            });
        },
        validate: validateNoteForm,
        validateOnChange: true,
    });

    const valid = form.isValid;

    return (
        <ItemCreatePanel type="note" formId={FORM_ID} valid={valid} handleCancelClick={onCancel}>
            <FormikProvider value={form}>
                <Form id={FORM_ID}>
                    <Field component={VaultSelectField} label={c('Label').t`Vault`} name="shareId" />
                    <Field
                        autoFocus
                        component={NoteTitleField}
                        label={c('Label').t`Name`}
                        name="name"
                        placeholder={c('Placeholder').t`Untitled`}
                    />
                    <Field
                        component={NoteTextAreaField}
                        label={c('Label').t`Note`}
                        name="note"
                        placeholder={c('Placeholder').t`Write your note`}
                    />
                </Form>
            </FormikProvider>
        </ItemCreatePanel>
    );
};
