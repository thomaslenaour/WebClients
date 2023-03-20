import { FC } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { isEmptyString } from '@proton/pass/utils/string';

import {
    PasswordField,
    TextAreaField,
    TextField,
    UrlGroupField,
    createNewUrl,
} from '../../../../shared/components/fields';
import { ItemHeaderControlled, ItemLayout } from '../../../../shared/components/item';
import { onBlurFallback } from '../../../../shared/form';
import { ItemEditProps } from '../../../../shared/items';
import { EditLoginItemFormValues, validateEditLoginForm } from './Login.validation';

const LoginEdit: FC<ItemEditProps<'login'>> = ({ vault, revision, onSubmit, onCancel }) => {
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

    return (
        <FormikProvider value={form}>
            <Form className="h100">
                <ItemLayout
                    header={
                        <ItemHeaderControlled
                            type="login"
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
                        </>
                    }
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

export default LoginEdit;
