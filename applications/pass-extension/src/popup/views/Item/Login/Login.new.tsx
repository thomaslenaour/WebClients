import { type VFC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { Button } from '@proton/atoms';
import { DropdownMenuButton, Icon } from '@proton/components';
import { itemCreationIntent } from '@proton/pass/store';
import { isEmptyString } from '@proton/pass/utils/string';
import { getEpoch } from '@proton/pass/utils/time/get-epoch';
import { omit } from '@proton/shared/lib/helpers/object';

import { ItemNewProps } from '../../../../shared/items';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { QuickActionsDropdown } from '../../../components/Dropdown/QuickActionsDropdown';
import { PasswordFieldWIP } from '../../../components/Fields/PasswordField';
import { TextFieldWIP } from '../../../components/Fields/TextField';
import { TextAreaFieldWIP } from '../../../components/Fields/TextareaField';
import { TitleField } from '../../../components/Fields/TitleField';
import { UrlGroupFieldCluster, createNewUrl } from '../../../components/Fields/UrlGroupFieldCluster';
import { ItemCreatePanel } from '../../../components/Panel/ItemCreatePanel';
import { usePopupContext } from '../../../context';
import AliasModal from '../Alias/Alias.modal';
import { NewLoginItemFormValues, validateNewLoginForm } from './Login.validation';

const FORM_ID = 'new-login';

export const LoginNew: VFC<ItemNewProps<'login'>> = ({ shareId, onSubmit, onCancel }) => {
    const dispatch = useDispatch();
    const { realm, subdomain } = usePopupContext();
    const isValidURL = realm !== undefined;
    const url = subdomain !== undefined ? subdomain : realm;
    const defaultName = isValidURL ? url! : '';

    const [aliasModalOpen, setAliasModalOpen] = useState(false);

    const initialValues: NewLoginItemFormValues = {
        name: defaultName,
        shareId,
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
                        <FieldsetCluster>
                            <Field
                                name="name"
                                label={c('Label').t`Title`}
                                placeholder={c('Placeholder').t`Untitled`}
                                autoFocus
                                component={TitleField}
                            />
                        </FieldsetCluster>

                        <FieldsetCluster>
                            <Field
                                name="username"
                                label={c('Label').t`Username`}
                                placeholder={c('Placeholder').t`Enter email or username`}
                                component={TextFieldWIP}
                                itemType="login"
                                icon="user"
                                {...(form.values.withAlias
                                    ? {
                                          suffix: form.values.aliasSuffix?.value,
                                          actions: (
                                              <QuickActionsDropdown>
                                                  <DropdownMenuButton
                                                      className="flex flex-align-items-center text-left"
                                                      onClick={() => {
                                                          void form.setValues((values: any) => ({
                                                              ...omit(
                                                                  values as NewLoginItemFormValues & {
                                                                      withAlias: true;
                                                                  },
                                                                  ['aliasPrefix', 'aliasSuffix', 'mailboxes']
                                                              ),
                                                              withAlias: false,
                                                          }));
                                                      }}
                                                  >
                                                      <Icon name="trash" className="mr0-5" />
                                                      {c('Action').t`Delete alias`}
                                                  </DropdownMenuButton>
                                              </QuickActionsDropdown>
                                          ),
                                      }
                                    : {
                                          actions: (
                                              <Button
                                                  icon
                                                  pill
                                                  color="weak"
                                                  shape="solid"
                                                  size="small"
                                                  className="pass-item-icon"
                                                  title={c('Action').t`Generate alias`}
                                                  onClick={() => setAliasModalOpen(true)}
                                              >
                                                  <Icon name="alias" size={24} />
                                              </Button>
                                          ),
                                      })}
                            />
                            <Field
                                name="password"
                                label={c('Label').t`Password`}
                                placeholder={c('Placeholder').t`Enter password`}
                                icon="key"
                                component={PasswordFieldWIP}
                            />
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
            </ItemCreatePanel>

            <AliasModal
                open={aliasModalOpen}
                onClose={() => setAliasModalOpen(false)}
                shareId={shareId}
                initialPrefix={url ?? form.values.username}
                onAliasSubmit={({ aliasPrefix, aliasSuffix, mailboxes }) => {
                    if (aliasPrefix !== undefined && aliasSuffix !== undefined && mailboxes.length > 0) {
                        form.setValues((values: any) => ({
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
