import { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Form, FormikProvider, useFormik } from 'formik';
import uniqid from 'uniqid';

import { selectRequestStatus, vaultCreationIntent } from '@proton/pass/store';
import { vaultCreate } from '@proton/pass/store/actions/requests';

import { VaultForm } from './Vault.form';
import { validateVaultValues } from './Vault.validation';
import type { VaultFormHandle, VaultFormValues } from './types';

const VaultNewRef: ForwardRefRenderFunction<
    VaultFormHandle,
    {
        onSubmit?: () => void;
        onSuccess?: () => void;
        onFailure?: () => void;
    }
> = ({ onSubmit, onSuccess, onFailure }, ref) => {
    const dispatch = useDispatch();

    const optimisticId = useMemo(() => uniqid(), []);
    const requestId = useMemo(() => vaultCreate(optimisticId), [optimisticId]);
    const status = useSelector(selectRequestStatus(requestId));

    const form = useFormik<VaultFormValues>({
        initialValues: { name: '', description: '' },
        validateOnChange: true,
        validate: validateVaultValues,
        onSubmit: ({ name, description }) => {
            onSubmit?.();
            dispatch(vaultCreationIntent({ id: optimisticId, content: { name, description } }));
        },
    });

    useEffect(() => {
        switch (status) {
            case 'success':
                return onSuccess?.();
            case 'failure':
                return onFailure?.();
        }
    }, [status]);

    useImperativeHandle(ref, () => ({ submit: form.submitForm }), [form]);

    return (
        <FormikProvider value={form}>
            <Form>
                <VaultForm />
            </Form>
        </FormikProvider>
    );
};

export const VaultNew = forwardRef(VaultNewRef);
