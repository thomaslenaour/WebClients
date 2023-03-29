import { type VFC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { getEpoch } from '@proton/pass/utils/time';

import { ItemNewProps } from '../../../../shared/items';
import { NoteTextAreaField, NoteTitleField } from '../../../components/Fields/Note/index';
import { ItemCreatePanel } from '../../../components/Panel/ItemCreatePanel';
import { validateNoteForm } from './Note.validation';

const FORM_ID = 'new-note';

const initialValues = { name: '', note: '' };

export const NoteNew: VFC<ItemNewProps<'note'>> = ({ shareId, onSubmit, onCancel }) => {
    const form = useFormik({
        initialValues,
        initialErrors: validateNoteForm(initialValues),
        onSubmit: ({ name, note }) => {
            const optimisticId = uniqid();

            onSubmit({
                type: 'note',
                optimisticId,
                shareId,
                createTime: getEpoch(),
                metadata: {
                    name,
                    note,
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
                    <Field
                        autoFocus
                        component={NoteTitleField}
                        label="Name"
                        name="name"
                        placeholder={c('Placeholder').t`Untitled`}
                    />
                    <Field
                        component={NoteTextAreaField}
                        label="Note"
                        name="note"
                        placeholder={c('Placeholder').t`Write your note`}
                    />
                </Form>
            </FormikProvider>
        </ItemCreatePanel>
    );
};
