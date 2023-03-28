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

const initialFieldValues = { name: '', note: '' };

export const NoteNew: VFC<ItemNewProps<'note'>> = ({ shareId, onSubmit, onCancel }) => {
    const form = useFormik({
        initialValues: {
            ...initialFieldValues,
            shareId,
        },
        initialErrors: validateNoteForm(initialFieldValues),
        onSubmit: ({ name, note, shareId }) => {
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
                        label=""
                        name="name"
                        placeholder={c('Placeholder').t`Untitled`}
                    />
                    <Field
                        component={NoteTextAreaField}
                        label=""
                        name="note"
                        placeholder={c('Placeholder').t`Write your message`}
                    />
                </Form>
            </FormikProvider>
        </ItemCreatePanel>
    );
};
