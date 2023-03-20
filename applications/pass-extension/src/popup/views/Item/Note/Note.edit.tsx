import { FC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';

import { TextAreaField } from '../../../../shared/components/fields';
import { ItemHeaderControlled, ItemLayout } from '../../../../shared/components/item';
import { onBlurFallback } from '../../../../shared/form';
import { ItemEditProps } from '../../../../shared/items';
import { validateNoteForm } from './Note.validation';

const NoteEdit: FC<ItemEditProps<'note'>> = ({ vault, revision, onSubmit, onCancel }) => {
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

    return (
        <FormikProvider value={form}>
            <Form className="h100">
                <ItemLayout
                    header={
                        <ItemHeaderControlled
                            type="note"
                            inputProps={{
                                name: 'name',
                                value: form.values.name,
                                onChange: form.handleChange,
                                onBlur: onBlurFallback(form, 'name', name),
                            }}
                        />
                    }
                    main={<Field name="note" label="Note" component={TextAreaField} />}
                    actions={
                        <div className="flex flex-justify-end">
                            <Button type="button" className="mr0-5" onClick={onCancel}>
                                {c('Action').t`Cancel`}
                            </Button>
                            <Button type="submit" color="norm" disabled={!form.isValid}>
                                {c('Action').t`Save`}
                            </Button>
                        </div>
                    }
                />
            </Form>
        </FormikProvider>
    );
};

export default NoteEdit;
