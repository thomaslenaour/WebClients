import { type VFC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { ItemEditProps } from '../../../../shared/items';
import { NoteTextAreaField, NoteTitleField } from '../../../components/Fields/Note/index';
import { ItemEditPanel } from '../../../components/Panel/ItemEditPanel';
import { validateNoteForm } from './Note.validation';

const FORM_ID = 'edit-note';

export const NoteEdit: VFC<ItemEditProps<'note'>> = ({ vault, revision, onSubmit, onCancel }) => {
    const { data: item, itemId, revision: lastRevision } = revision;
    const { metadata, extraFields } = item;
    const { name, note, itemUuid } = metadata;

    const form = useFormik({
        initialValues: {
            name,
            note,
        },
        onSubmit: ({ name, note }) => {
            onSubmit({
                type: 'note',
                itemId,
                shareId: vault.shareId,
                lastRevision,
                metadata: { note, name, itemUuid },
                content: {},
                extraFields,
            });
        },
        validate: validateNoteForm,
        validateOnChange: true,
    });

    const valid = form.isValid;

    return (
        <ItemEditPanel type="note" formId={FORM_ID} valid={valid} handleCancelClick={onCancel}>
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
        </ItemEditPanel>
    );
};
