import { type VFC, useState } from 'react';
import { useSelector } from 'react-redux';

import { Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { Option } from '@proton/components';
import { selectMailboxesForAlias } from '@proton/pass/store';

import { useAliasOptions } from '../../../../shared/hooks';
import { ItemEditProps } from '../../../../shared/items';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { ValueControl } from '../../../components/Controls/ValueControl';
import { Field } from '../../../components/Fields/Field';
import { SelectFieldWIP } from '../../../components/Fields/SelectField';
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

                    <FieldsetCluster mode="read" as="div">
                        <ValueControl icon="alias" label={c('Label').t`Alias address`}>
                            {aliasEmail}
                        </ValueControl>
                    </FieldsetCluster>

                    <FieldsetCluster>
                        <Field
                            name="mailboxes"
                            label={c('Label').t`Forwarded to`}
                            placeholder={c('Label').t`Select an email address`}
                            component={SelectFieldWIP}
                            icon="arrow-up-and-right-big"
                            multiple
                            disabled={aliasOptionsLoading || !aliasOptions || aliasOptions.mailboxes.length <= 1}
                            loading={aliasOptionsLoading}
                        >
                            {(aliasOptions?.mailboxes ?? []).map((mailbox) => (
                                <Option value={mailbox} title={mailbox.email} key={mailbox.id}>
                                    {mailbox.email}
                                </Option>
                            ))}
                        </Field>
                    </FieldsetCluster>

                    <FieldsetCluster>
                        <Field
                            name="note"
                            label={c('Label').t`Note`}
                            placeholder={c('Placeholder').t`Enter a note ...`}
                            component={TextAreaFieldWIP}
                            icon="note"
                        />
                    </FieldsetCluster>
                </Form>
            </FormikProvider>
        </ItemEditPanel>
    );
};
