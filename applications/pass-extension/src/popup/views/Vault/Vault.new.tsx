import { type VFC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FormikProvider, useFormik } from 'formik';
import uniqid from 'uniqid';

import { selectRequestStatus, vaultCreationIntent } from '@proton/pass/store';
import { vaultCreate } from '@proton/pass/store/actions/requests';
import { VaultColor, VaultIcon } from '@proton/pass/types/protobuf/vault-v1';

import { VaultForm, VaultFormValues } from '../../components/Vault/VaultForm';
import { validateVaultValues } from './Vault.validation';

type Props = {
    onSubmit?: () => void;
    onSuccess?: () => void;
    onFailure?: () => void;
};

export const FORM_ID = 'vault-create';

export const VaultNew: VFC<Props> = ({ onSubmit, onSuccess, onFailure }) => {
    const dispatch = useDispatch();

    const optimisticId = useMemo(() => uniqid(), []);
    const requestId = useMemo(() => vaultCreate(optimisticId), [optimisticId]);
    const status = useSelector(selectRequestStatus(requestId));

    const form = useFormik<VaultFormValues>({
        initialValues: {
            name: '',
            description: '',
            color: VaultColor.COLOR1,
            icon: VaultIcon.ICON1,
        },
        validateOnChange: true,
        validate: validateVaultValues,
        onSubmit: ({ name, description, color, icon }) => {
            onSubmit?.();
            dispatch(
                vaultCreationIntent({
                    id: optimisticId,
                    content: {
                        name,
                        description,
                        display: {
                            color,
                            icon,
                        },
                    },
                })
            );
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

    return (
        <FormikProvider value={form}>
            <VaultForm form={form} formId={FORM_ID} />
        </FormikProvider>
    );
};
