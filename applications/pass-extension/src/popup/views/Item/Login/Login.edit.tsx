import { type VFC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { isEmptyString } from '@proton/pass/utils/string';

import {
    PasswordField,
    TextAreaField,
    TextField,
    UrlGroupField,
    createNewUrl,
} from '../../../../shared/components/fields';
import { onBlurFallback } from '../../../../shared/form';
import { ItemEditProps } from '../../../../shared/items';
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
                    <Field name="name" label={c('Label').t`Name`} component={TextField} />
                    <Field
                        name="username"
                        label={c('Label').t`Username`}
                        component={TextField}
                        onBlur={onBlurFallback(form, 'username', username)}
                        placeholder={c('Placeholder').t`Enter email or username`}
                    />

                    <Field
                        name="password"
                        label={c('Label').t`Password`}
                        component={PasswordField}
                        onBlur={onBlurFallback(form, 'password', password)}
                    />

                    <UrlGroupField form={form} />

                    <Field name="note" label={c('Label').t`Note`} component={TextAreaField} rows={5} />
                </Form>
            </FormikProvider>
        </ItemEditPanel>
    );
};
