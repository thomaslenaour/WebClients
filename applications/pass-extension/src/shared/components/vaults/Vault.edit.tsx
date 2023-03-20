import { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Form, FormikProvider, useFormik } from 'formik';

import { acknowledge, selectRequestStatus, vaultEditIntent } from '@proton/pass/store';
import { vaultEdit } from '@proton/pass/store/actions/requests';
import type { VaultShare } from '@proton/pass/types';

import { VaultForm } from './Vault.form';
import { validateVaultValues } from './Vault.validation';
import type { VaultFormHandle, VaultFormValues } from './types';

const VaultEditRef: ForwardRefRenderFunction<
    VaultFormHandle,
    {
        vault: VaultShare;
        onSubmit?: () => void;
        onSuccess?: () => void;
        onFailure?: () => void;
    }
> = ({ vault, onSubmit, onSuccess, onFailure }, ref) => {
    const dispatch = useDispatch();

    const requestId = useMemo(() => vaultEdit(vault.shareId), [vault.shareId]);
    const status = useSelector(selectRequestStatus(requestId));

    const form = useFormik<VaultFormValues>({
        initialValues: { name: vault.content.name, description: vault.content.description },
        validateOnChange: true,
        validate: validateVaultValues,
        onSubmit: ({ name, description }) => {
            onSubmit?.();
            dispatch(vaultEditIntent({ id: vault.shareId, content: { name, description } }));
        },
    });

    useEffect(() => {
        switch (status) {
            case 'start':
                break;
            case 'success':
                onSuccess?.();
            case 'failure':
                onFailure?.();
            /**
             * In case of either sucess or failure, "acknowledge" the request to discard it from the store.
             * This is necessary to prevent the next edition attempt for the same vault, to re-use the same request state.
             * FIXME: This likely should not live at the component level since it can be unmounted while the request is ongoing,
             *        it'd probably still work since the previous request would be acknowledged immediately and a new one would be generated
             *        but it's not ideal.
             */
            default:
                dispatch(acknowledge(requestId));
        }
    }, [status, requestId]);

    useImperativeHandle(ref, () => ({ submit: form.submitForm }), [form]);

    return (
        <FormikProvider value={form}>
            <Form>
                <VaultForm />
            </Form>
        </FormikProvider>
    );
};

export const VaultEdit = forwardRef(VaultEditRef);
