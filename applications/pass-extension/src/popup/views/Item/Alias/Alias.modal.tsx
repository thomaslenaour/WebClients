import { FC, useEffect, useState } from 'react';

import { useFormik } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { ModalProps, ModalTwo, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '@proton/components/components';

import AliasForm from './Alias.form';
import { AliasFormValues, validateAliasForm } from './Alias.validation';

export type AliasModalRef = {
    open: () => void;
};

export type AliasModalProps = {
    initialPrefix?: string;
    shareId: string;
    onAliasSubmit: (values: AliasFormValues) => void;
} & ModalProps;

const initialValues: AliasFormValues = {
    aliasPrefix: '',
    aliasSuffix: undefined,
    mailboxes: [],
};

const AliasModal: FC<AliasModalProps> = ({ initialPrefix, shareId, onAliasSubmit, ...modalProps }) => {
    const [ready, setReady] = useState(false);

    const form = useFormik<AliasFormValues>({
        initialValues,
        initialErrors: validateAliasForm(initialValues),
        onSubmit: (values) => {
            onAliasSubmit(values);
            modalProps.onClose?.();

            form.setValues(initialValues)
                .then(() => form.setErrors({}))
                .catch(console.warn);
        },
        validate: validateAliasForm,
        validateOnChange: true,
    });

    useEffect(() => {
        form.setFieldValue('aliasPrefix', initialPrefix ?? '')
            .then(() => form.setErrors({}))
            .catch(console.warn);
    }, [initialPrefix]);

    return (
        <ModalTwo {...modalProps} size="small">
            <ModalTwoHeader title={c('Action').t`Generate alias`} />
            <ModalTwoContent>
                <AliasForm
                    shareId={shareId}
                    form={form}
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
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button disabled={!ready || !form.isValid} fullWidth onClick={() => form.handleSubmit()}>
                    {c('Action').t`Fill in & save alias`}
                </Button>
            </ModalTwoFooter>
        </ModalTwo>
    );
};

export default AliasModal;
