import { type VFC } from 'react';

import { Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { isEmptyString } from '@proton/pass/utils/string';

import { ItemEditProps } from '../../../../shared/items';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { Field } from '../../../components/Fields/Field';
import { PasswordFieldWIP } from '../../../components/Fields/PasswordField';
import { TextFieldWIP } from '../../../components/Fields/TextField';
import { TextAreaFieldWIP } from '../../../components/Fields/TextareaField';
import { TitleField } from '../../../components/Fields/TitleField';
import { UrlGroupFieldCluster, createNewUrl } from '../../../components/Fields/UrlGroupFieldCluster';
import { ItemEditPanel } from '../../../components/Panel/ItemEditPanel';
import { EditLoginItemFormValues, validateEditLoginForm } from './Login.validation';

const FORM_ID = 'edit-login';

export const LoginEdit: VFC<ItemEditProps<'login'>> = ({ vault, revision, onSubmit, onCancel }) => {
    const { data: item, itemId, revision: lastRevision } = revision;
    const { metadata, content, extraFields } = item;
    const { name, note, itemUuid } = metadata;
    const { username, password, urls } = content;

    const form = useFormik<EditLoginItemFormValues>({
        initialValues: {
            name,
            username,
            password,
            note,
            shareId: vault.shareId,
            url: '',
            urls: urls.map(createNewUrl),
        },
        onSubmit: ({ name, username, password, url, urls, note }) => {
            onSubmit({
                type: 'login',
                itemId,
                shareId: vault.shareId,
                lastRevision,
                metadata: { name, note, itemUuid },
                content: {
                    username,
                    password,
                    urls: Array.from(new Set(urls.map(({ url }) => url).concat(isEmptyString(url) ? [] : [url]))),
                    totpUri: '',
                },
                extraFields,
            });
        },
        validate: validateEditLoginForm,
        validateOnChange: true,
    });

    const valid = form.isValid;

    return (
        <ItemEditPanel type="login" formId={FORM_ID} valid={valid} handleCancelClick={onCancel}>
            <FormikProvider value={form}>
                <Form id={FORM_ID}>
                    <FieldsetCluster>
                        <Field name="name" label={c('Label').t`Title`} component={TitleField} />
                    </FieldsetCluster>
                    <FieldsetCluster>
                        <Field
                            name="username"
                            component={TextFieldWIP}
                            label={c('Label').t`Username`}
                            placeholder={c('Placeholder').t`Enter email or username`}
                            itemType="login"
                            icon="user"
                        />
                        <Field name="password" label={c('Label').t`Password`} component={PasswordFieldWIP} icon="key" />
                    </FieldsetCluster>

                    <UrlGroupFieldCluster form={form} />

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
