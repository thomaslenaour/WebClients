import { type VFC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FormikProvider, useFormik } from 'formik';

import { selectRequestStatus, vaultEditIntent } from '@proton/pass/store';
import { vaultEdit } from '@proton/pass/store/actions/requests';
import type { VaultShare } from '@proton/pass/types';
import { VaultColor, VaultIcon } from '@proton/pass/types/protobuf/vault-v1';

import { VaultForm, VaultFormValues } from '../../components/Vault/VaultForm';
import { validateVaultValues } from './Vault.validation';

type Props = {
    vault: VaultShare;
    onSubmit?: () => void;
    onSuccess?: () => void;
    onFailure?: () => void;
};

export const FORM_ID = 'vault-edit';

export const VaultEdit: VFC<Props> = ({ vault, onSubmit, onSuccess, onFailure }) => {
    const dispatch = useDispatch();

    const requestId = useMemo(() => vaultEdit(vault.shareId), [vault.shareId]);
    const status = useSelector(selectRequestStatus(requestId));

    const form = useFormik<VaultFormValues>({
        initialValues: {
            name: vault.content.name,
            description: vault.content.description,
            color: vault.content.display.color ?? VaultColor.COLOR1,
            icon: vault.content.display.icon ?? VaultIcon.ICON1,
        },
        validateOnChange: true,
        validate: validateVaultValues,
        onSubmit: ({ name, description, color, icon }) => {
            onSubmit?.();
            dispatch(
                vaultEditIntent({
                    id: vault.shareId,
                    content: { name, description, display: { color, icon } },
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
            default:
                return;
        }
    }, [status, requestId]);

    return (
        <FormikProvider value={form}>
            <VaultForm form={form} formId={FORM_ID} />
        </FormikProvider>
    );
};
