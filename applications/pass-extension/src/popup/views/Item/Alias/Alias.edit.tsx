import { type VFC, useState } from 'react';
import { useSelector } from 'react-redux';

import { Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { InputFieldTwo, Option, SelectTwo } from '@proton/components';
import { selectMailboxesForAlias } from '@proton/pass/store';

import { TextFieldValue } from '../../../../shared/components/fields';
import { useAliasOptions } from '../../../../shared/hooks';
import { ItemEditProps } from '../../../../shared/items';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { Field } from '../../../components/Fields/Field';
import { TextAreaFieldWIP } from '../../../components/Fields/TextareaField';
import { TitleField } from '../../../components/Fields/TitleField';
import { ItemEditPanel } from '../../../components/Panel/ItemEditPanel';
import { EditAliasFormValues, validateEditAliasForm } from './Alias.validation';

const FORM_ID = 'edit-alias';

export const AliasEdit: VFC<ItemEditProps<'alias'>> = ({ vault, revision, onCancel, onSubmit }) => {
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

    const valid = ready && form.isValid;

    return (
        <ItemEditPanel type="alias" formId={FORM_ID} handleCancelClick={onCancel} valid={valid}>
            <FormikProvider value={form}>
                <Form id={FORM_ID}>
                    <FieldsetCluster>
                        <Field
                            name="name"
                            label={c('Label').t`Title`}
                            placeholder={c('Label').t`Untitled`}
                            component={TitleField}
                        />
                    </FieldsetCluster>

                    <div className="text-semibold mb0-5">{c('Label').t`Alias`}</div>
                    <TextFieldValue>{aliasEmail!}</TextFieldValue>

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

                    <FieldsetCluster>
                        <Field
                            name="note"
                            label={c('Label').t`Note`}
                            placeholder={c('Placeholder').t`Enter a note ...`}
                            component={TextAreaFieldWIP}
                            icon="note"
                            rows={2}
                        />
                    </FieldsetCluster>
                </Form>
            </FormikProvider>
        </ItemEditPanel>
    );
};
