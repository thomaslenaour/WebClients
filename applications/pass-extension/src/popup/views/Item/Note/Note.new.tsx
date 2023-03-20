import { FC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { Button } from '@proton/atoms';
import { getEpoch } from '@proton/pass/utils/time';

import { TextAreaField } from '../../../../shared/components/fields';
import { ItemHeaderControlled, ItemLayout } from '../../../../shared/components/item';
import { onBlurFallback } from '../../../../shared/form';
import { ItemNewProps } from '../../../../shared/items';
import { validateNoteForm } from './Note.validation';

const NoteNew: FC<ItemNewProps<'note'>> = ({ vaultId, onSubmit, onCancel }) => {
    const defaultName = c('Placeholder').t`Unnamed`;
    const form = useFormik({
        initialValues: {
            name: defaultName,
            note: '',
            shareId: vaultId,
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
                                onBlur: onBlurFallback(form, 'name', defaultName),
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

export default NoteNew;
