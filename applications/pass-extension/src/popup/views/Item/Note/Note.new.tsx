import { type VFC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { getEpoch } from '@proton/pass/utils/time';

import { TextAreaField, TextField } from '../../../../shared/components/fields';
import { ItemNewProps } from '../../../../shared/items';
import { ItemCreatePanel } from '../../../components/Panel/ItemCreatePanel';
import { validateNoteForm } from './Note.validation';

const FORM_ID = 'new-note';

export const NoteNew: VFC<ItemNewProps<'note'>> = ({ shareId, onSubmit, onCancel }) => {
    const defaultName = c('Placeholder').t`Unnamed`;
    const form = useFormik({
        initialValues: {
            name: defaultName,
            note: '',
            shareId,
        },
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
                    <Field name="name" label="Name" component={TextField} />
                    <Field name="note" label="Note" component={TextAreaField} />
                </Form>
            </FormikProvider>
        </ItemCreatePanel>
    );
};
