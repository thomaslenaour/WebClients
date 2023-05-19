import { type VFC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { selectAliasLimits } from '@proton/pass/store';
import { merge } from '@proton/pass/utils/object';
import { uniqueId } from '@proton/pass/utils/string';
import { getEpoch } from '@proton/pass/utils/time/get-epoch';

import { useAliasOptions } from '../../../../shared/hooks/useAliasOptions';
import { type ItemNewProps } from '../../../../shared/items';
import { deriveAliasPrefixFromName } from '../../../../shared/items/alias';
import { UpgradeButton } from '../../../components/Button/UpgradeButton';
import { ValueControl } from '../../../components/Field/Control/ValueControl';
import { Field } from '../../../components/Field/Field';
import { FieldsetCluster } from '../../../components/Field/Layout/FieldsetCluster';
import { TextAreaField } from '../../../components/Field/TextareaField';
import { TitleField } from '../../../components/Field/TitleField';
import { VaultSelectField } from '../../../components/Field/VaultSelectField';
import { ItemCard } from '../../../components/Item/ItemCard';
import { ItemCreatePanel } from '../../../components/Panel/ItemCreatePanel';
import { usePopupContext } from '../../../hooks/usePopupContext';
import { MAX_ITEM_NAME_LENGTH, MAX_ITEM_NOTE_LENGTH } from '../Item/Item.validation';
import { AliasForm } from './Alias.form';
import { type NewAliasFormValues, validateNewAliasForm } from './Alias.validation';

const FORM_ID = 'new-alias';

export const AliasNew: VFC<ItemNewProps<'alias'>> = ({ shareId, onSubmit, onCancel }) => {
    const { realm, subdomain } = usePopupContext();
    const [ready, setReady] = useState(false);

    const { aliasAllowCreate } = useSelector(selectAliasLimits);

    const isValidURL = realm !== undefined;
    const url = subdomain !== undefined ? subdomain : realm;
    const defaultName = isValidURL ? url! : '';

    const initialValues: NewAliasFormValues = {
        name: defaultName,
        note: isValidURL ? c('Placeholder').t`Used on ${url}` : '',
        shareId,
        aliasPrefix: '',
        aliasSuffix: undefined,
        mailboxes: [],
    };

    const form = useFormik<NewAliasFormValues>({
        initialErrors: validateNewAliasForm(initialValues),
        initialValues,
        onSubmit: ({ name, note, shareId, aliasPrefix, aliasSuffix, mailboxes }) => {
            if (aliasPrefix !== undefined && aliasSuffix !== undefined) {
                const optimisticId = uniqueId();

                onSubmit({
                    type: 'alias',
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
                    extraData: {
                        mailboxes,
                        prefix: aliasPrefix,
                        signedSuffix: aliasSuffix.signature,
                        aliasEmail: aliasPrefix + aliasSuffix.value,
                    },
                });
            }
        },
        validate: validateNewAliasForm,
        validateOnChange: true,
    });

    const { aliasOptions, aliasOptionsLoading } = useAliasOptions({
        shareId,
        onAliasOptionsLoaded: ({ suffixes, mailboxes }) => {
            const firstSuffix = suffixes?.[0];
            const firstMailBox = mailboxes?.[0];

            const values = merge(form.values, {
                ...(firstSuffix && { aliasSuffix: firstSuffix }),
                ...(firstMailBox && { mailboxes: [firstMailBox] }),
            });

            form.resetForm({ errors: validateNewAliasForm(values), values });
            setReady(true);
        },
    });

    const { values, touched, setFieldValue } = form;
    const { name, aliasPrefix, aliasSuffix } = values;

    useEffect(() => {
        void (!touched.aliasPrefix && setFieldValue('aliasPrefix', deriveAliasPrefixFromName(name), true));
    }, [name, touched.aliasPrefix]);

    return (
        <ItemCreatePanel
            type="alias"
            formId={FORM_ID}
            handleCancelClick={onCancel}
            valid={ready && form.isValid}
            discardable={!form.dirty}
            {...(!aliasAllowCreate ? { renderSubmitButton: <UpgradeButton key="upgrade-button" /> } : {})}
        >
            {({ canFocus }) => (
                <>
                    {!aliasAllowCreate && (
                        <ItemCard className="mb-2">
                            {c('Info')
                                .t`You have reached the limit of aliases you can create. Create an unlimited number of aliases when you upgrade your subscription.`}
                        </ItemCard>
                    )}
                    <FormikProvider value={form}>
                        <Form id={FORM_ID}>
                            <FieldsetCluster>
                                <Field component={VaultSelectField} label={c('Label').t`Vault`} name="shareId" />
                                <Field
                                    name="name"
                                    label={c('Label').t`Title`}
                                    placeholder={c('Label').t`Untitled`}
                                    component={TitleField}
                                    autoFocus={canFocus && aliasAllowCreate}
                                    key={`alias-name-${canFocus}`}
                                    maxLength={MAX_ITEM_NAME_LENGTH}
                                />
                            </FieldsetCluster>

                            <FieldsetCluster mode="read" as="div">
                                <ValueControl
                                    icon="alias"
                                    label={c('Label').t`You are about to create`}
                                    loading={aliasOptionsLoading}
                                    invalid={Boolean(
                                        Object.keys(form.touched).length > 0 &&
                                            (form.errors.aliasPrefix || form.errors.aliasSuffix)
                                    )}
                                >
                                    {`${aliasPrefix}${aliasSuffix?.value ?? ''}`}
                                </ValueControl>
                            </FieldsetCluster>

                            <AliasForm
                                aliasOptions={aliasOptions}
                                aliasOptionsLoading={aliasOptionsLoading}
                                form={form}
                            />

                            <FieldsetCluster>
                                <Field
                                    name="note"
                                    label={c('Label').t`Note`}
                                    placeholder={c('Placeholder').t`Enter a note...`}
                                    component={TextAreaField}
                                    icon="note"
                                    maxLength={MAX_ITEM_NOTE_LENGTH}
                                />
                            </FieldsetCluster>
                        </Form>
                    </FormikProvider>
                </>
            )}
        </ItemCreatePanel>
    );
};
