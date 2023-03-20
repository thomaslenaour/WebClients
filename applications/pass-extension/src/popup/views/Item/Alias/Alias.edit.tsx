import { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { InputFieldTwo, Option, SelectTwo } from '@proton/components';
import { selectMailboxesForAlias } from '@proton/pass/store';

import { TextAreaField, TextFieldValue } from '../../../../shared/components/fields';
import { ItemHeaderControlled, ItemLayout } from '../../../../shared/components/item';
import { onBlurFallback } from '../../../../shared/form';
import { useAliasOptions } from '../../../../shared/hooks';
import { ItemEditProps } from '../../../../shared/items';
import { EditAliasFormValues, validateEditAliasForm } from './Alias.validation';

const AliasEdit: FC<ItemEditProps<'alias'>> = ({ vault, revision, onCancel, onSubmit }) => {
    const { data: item, itemId, aliasEmail, revision: lastRevision } = revision;
    const { metadata, ...uneditable } = item;
    const { name, note, itemUuid } = metadata;
    const [ready, setReady] = useState(false);
    const mailboxesForAlias = useSelector(selectMailboxesForAlias(aliasEmail!));

    const form = useFormik<EditAliasFormValues>({
        initialValues: { name, note, mailboxes: [] },
        onSubmit: ({ name, note, mailboxes }) => {
            onSubmit({
                ...uneditable,
                shareId: vault.shareId,
                itemId,
                lastRevision,
                metadata: {
                    name,
                    note,
                    itemUuid,
                },
                extraData: {
                    mailboxes,
                    aliasEmail: aliasEmail!,
                },
            });
        },
        validate: validateEditAliasForm,
        validateOnChange: true,
    });

    const { aliasOptions, aliasOptionsLoading } = useAliasOptions({
        shareId: vault.shareId,
        onAliasOptionsLoaded: async ({ mailboxes }) => {
            try {
                await form.setFieldValue(
                    'mailboxes',
                    mailboxesForAlias
                        ?.map((mailbox) => mailboxes.find(({ email }) => email === mailbox.email))
                        .filter(Boolean)
                );

                setReady(true);
            } catch (_) {}
        },
    });

    return (
        <FormikProvider value={form}>
            <Form className="h100">
                <ItemLayout
                    header={
                        <ItemHeaderControlled
                            type="alias"
                            inputProps={{
                                name: 'name',
                                value: form.values.name,
                                onChange: form.handleChange,
                                onBlur: onBlurFallback(form, 'name', name),
                            }}
                        />
                    }
                    main={
                        <>
                            <div className="text-semibold mb0-5">{c('Label').t`Alias`}</div>
                            <TextFieldValue>{aliasEmail!}</TextFieldValue>

                            <hr className="my0-5" />

                            <InputFieldTwo
                                label={c('Label').t`Mailboxes`}
                                as={SelectTwo}
                                name="mailboxes"
                                value={form.values.mailboxes}
                                onValue={(mailboxes: any) => form.setFieldValue('mailboxes', mailboxes)}
                                multiple
                                dense
                                {...(aliasOptionsLoading
                                    ? {
                                          renderSelected: () => (
                                              <div className="extension-skeleton extension-skeleton--select" />
                                          ),
                                      }
                                    : {})}
                            >
                                {(aliasOptions?.mailboxes ?? []).map((mailbox) => (
                                    <Option value={mailbox} title={mailbox.email} key={mailbox.id}>
                                        {mailbox.email}
                                    </Option>
                                ))}
                            </InputFieldTwo>

                            <hr className="mt1 mb0-5" />

                            <Field name="note" label="Note" component={TextAreaField} rows={5} />
                        </>
                    }
                    actions={
                        <div className="flex flex-justify-end">
                            <Button type="button" className="mr0-5" onClick={onCancel}>
                                {c('Action').t`Cancel`}
                            </Button>
                            <Button
                                type="submit"
                                color="norm"
                                disabled={aliasOptionsLoading || !ready || !form.isValid}
                            >
                                {c('Action').t`Save`}
                            </Button>
                        </div>
                    }
                />
            </Form>
        </FormikProvider>
    );
};

export default AliasEdit;
