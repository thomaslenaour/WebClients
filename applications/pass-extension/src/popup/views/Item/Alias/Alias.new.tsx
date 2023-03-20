import { FC, useState } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { Button } from '@proton/atoms';
import { getEpoch } from '@proton/pass/utils/time/get-epoch';

import { TextAreaField } from '../../../../shared/components/fields';
import { ItemHeaderControlled, ItemLayout } from '../../../../shared/components/item';
import { onBlurFallback } from '../../../../shared/form';
import { ItemNewProps } from '../../../../shared/items';
import { usePopupContext } from '../../../context';
import AliasForm from './Alias.form';
import { NewAliasFormValues, validateNewAliasForm } from './Alias.validation';

const AliasNew: FC<ItemNewProps<'alias'>> = ({ vaultId, onSubmit, onCancel }) => {
    const [ready, setReady] = useState(false);

    const { realm, subdomain } = usePopupContext();
    const isValidURL = realm !== undefined;
    const url = subdomain !== undefined ? subdomain : realm;
    const defaultName = isValidURL ? url! : c('Placeholder').t`Unnamed`;

    const form = useFormik<NewAliasFormValues>({
        initialValues: {
            name: defaultName,
            note: isValidURL ? c('Placeholder').t`Used on ${url}` : '',
            shareId: vaultId,
            aliasPrefix: isValidURL ? url : '',
            aliasSuffix: undefined,
            mailboxes: [],
        },
        onSubmit: ({ name, note, shareId, aliasPrefix, aliasSuffix, mailboxes }) => {
            if (aliasPrefix !== undefined && aliasSuffix !== undefined) {
                const optimisticId = uniqid();

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
                                onBlur: onBlurFallback(form, 'name', defaultName),
                            }}
                        />
                    }
                    main={
                        <>
                            <AliasForm<NewAliasFormValues>
                                form={form}
                                shareId={vaultId}
                                onAliasOptionsLoaded={async (aliasOptions) => {
                                    const firstSuffix = aliasOptions.suffixes?.[0];
                                    const firstMailBox = aliasOptions.mailboxes?.[0];

                                    await form.setValues(
                                        (values) => ({
                                            ...values,
                                            ...(firstSuffix !== undefined ? { aliasSuffix: firstSuffix } : {}),
                                            ...(firstMailBox !== undefined ? { mailboxes: [firstMailBox] } : {}),
                                        }),
                                        true
                                    );

                                    setReady(true);
                                }}
                            />
                            <br />
                            <Field
                                name="note"
                                label={c('Label').t`Note`}
                                component={TextAreaField}
                                assistContainerClassName="hidden-empty"
                                rows={5}
                            />
                        </>
                    }
                    actions={
                        <div className="flex flex-justify-end">
                            <Button type="button" className="mr0-5" onClick={onCancel}>
                                {c('Action').t`Cancel`}
                            </Button>
                            <Button disabled={!ready || !form.isValid} type="submit" color="norm">
                                {c('Action').t`Save`}
                            </Button>
                        </div>
                    }
                />
            </Form>
        </FormikProvider>
    );
};

export default AliasNew;
