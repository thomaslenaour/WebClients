import { type VFC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { Button } from '@proton/atoms';
import { Icon, Tooltip } from '@proton/components';
import { itemCreationIntent } from '@proton/pass/store';
import { isEmptyString } from '@proton/pass/utils/string';
import { getEpoch } from '@proton/pass/utils/time/get-epoch';
import { omit } from '@proton/shared/lib/helpers/object';

import AliasPreview from '../../../../shared/components/alias/Alias.preview';
import {
    PasswordField,
    TextAreaField,
    TextField,
    UrlGroupField,
    createNewUrl,
} from '../../../../shared/components/fields';
import { ItemNewProps } from '../../../../shared/items';
import { ItemCreatePanel } from '../../../components/Panel/ItemCreatePanel';
import { usePopupContext } from '../../../context';
import AliasModal from '../Alias/Alias.modal';
import { NewLoginItemFormValues, validateNewLoginForm } from './Login.validation';

const FORM_ID = 'new-login';

export const LoginNew: VFC<ItemNewProps<'login'>> = ({ vaultId, onSubmit, onCancel }) => {
    const dispatch = useDispatch();
    const { realm, subdomain } = usePopupContext();
    const isValidURL = realm !== undefined;
    const url = subdomain !== undefined ? subdomain : realm;
    const defaultName = isValidURL ? url! : c('Placeholder').t`Unnamed`;

    const [aliasModalOpen, setAliasModalOpen] = useState(false);

    const initialValues: NewLoginItemFormValues = {
        name: defaultName,
        shareId: vaultId,
        username: '',
        password: '',
        note: '',
        url: isValidURL ? createNewUrl(url!).url : '',
        urls: [],
        withAlias: false,
    };

    const form = useFormik<NewLoginItemFormValues>({
        initialValues,
        initialErrors: validateNewLoginForm(initialValues),
        onSubmit: ({ name, note, username, password, shareId, url, urls, ...values }) => {
            const createTime = getEpoch();
            const optimisticId = uniqid();

            const withAlias =
                values.withAlias &&
                values.aliasSuffix !== undefined &&
                values.aliasPrefix !== undefined &&
                values.mailboxes.length > 0;

            if (withAlias) {
                dispatch(
                    itemCreationIntent({
                        type: 'alias',
                        optimisticId: `${optimisticId}-alias`,
                        shareId,
                        createTime: createTime - 1 /* alias will be created before login in saga */,
                        metadata: {
                            name: `Alias for ${name}`,
                            note: '',
                            itemUuid: uniqid(),
                        },
                        content: {},
                        extraData: {
                            mailboxes: values.mailboxes,
                            prefix: username,
                            signedSuffix: values.aliasSuffix!.signature,
                            aliasEmail: username + values.aliasSuffix!.value,
                        },
                        extraFields: [],
                    })
                );
            }

            onSubmit({
                type: 'login',
                optimisticId,
                shareId,
                createTime,
                metadata: {
                    name,
                    note,
                    itemUuid: optimisticId,
                },
                content: {
                    username: withAlias ? username + values.aliasSuffix!.value : username,
                    password,
                    urls: Array.from(new Set(urls.map(({ url }) => url).concat(isEmptyString(url) ? [] : [url]))),
                    totpUri: '',
                },
                extraFields: [],
            });
        },
        validate: validateNewLoginForm,
        validateOnChange: true,
    });

    const valid = form.isValid;

    return (
        <>
            <ItemCreatePanel type="login" formId={FORM_ID} valid={valid} handleCancelClick={onCancel}>
                <FormikProvider value={form}>
                    <Form id={FORM_ID}>
                        <Field name="name" label={c('Label').t`Name`} component={TextField} />
                        <Field
                            name="username"
                            label={c('Label').t`Username`}
                            placeholder={c('Placeholder').t`Enter email or username`}
                            component={TextField}
                            {...(form.values.withAlias
                                ? {
                                      suffix: form.values.aliasSuffix?.value,
                                      action: (
                                          <Button
                                              icon
                                              onClick={() =>
                                                  form.setValues((values) => ({
                                                      ...omit(
                                                          values as NewLoginItemFormValues & {
                                                              withAlias: true;
                                                          },
                                                          ['aliasPrefix', 'aliasSuffix', 'mailboxes']
                                                      ),
                                                      withAlias: false,
                                                  }))
                                              }
                                              className="ml0-5 flex-align-self-end"
                                          >
                                              <Icon name="trash" />
                                          </Button>
                                      ),
                                  }
                                : {
                                      action: (
                                          <Tooltip title={c('Action').t`Generate alias`}>
                                              <Button icon onClick={() => setAliasModalOpen(true)} className="ml0-5">
                                                  <Icon name="alias" />
                                              </Button>
                                          </Tooltip>
                                      ),
                                  })}
                        />
                        {form.values.withAlias && (
                            <AliasPreview
                                prefix={form.values.username}
                                suffix={form.values.aliasSuffix!.value}
                                className="mt0-5"
                            />
                        )}

                        <Field name="password" label={c('Label').t`Password`} component={PasswordField} />

                        <UrlGroupField form={form} />

                        <Field
                            name="note"
                            label={c('Label').t`Note`}
                            component={TextAreaField}
                            rootClassName="mb0"
                            rows={5}
                        />
                    </Form>
                </FormikProvider>
            </ItemCreatePanel>

            <AliasModal
                open={aliasModalOpen}
                onClose={() => setAliasModalOpen(false)}
                shareId={vaultId}
                initialPrefix={url ?? form.values.username}
                onAliasSubmit={({ aliasPrefix, aliasSuffix, mailboxes }) => {
                    if (aliasPrefix !== undefined && aliasSuffix !== undefined && mailboxes.length > 0) {
                        form.setValues((values) => ({
                            ...values,
                            withAlias: true,
                            username: aliasPrefix,
                            aliasPrefix,
                            aliasSuffix,
                            mailboxes,
                        })).catch(console.warn);
                    }
                }}
            />
        </>
    );
};
