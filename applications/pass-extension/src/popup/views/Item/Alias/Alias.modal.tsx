import { FC, useEffect, useState } from 'react';

import { FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, ModalProps } from '@proton/components/components';

import { SidebarModal } from '../../../../shared/components/sidebarmodal/SidebarModal';
import { useAliasOptions } from '../../../../shared/hooks/useAliasOptions';
import { PanelHeader } from '../../../components/Panel/Header';
import { Panel } from '../../../components/Panel/Panel';
import { AliasForm } from './Alias.form';
import { AliasFormValues, validateAliasForm } from './Alias.validation';

export type AliasModalRef = {
    open: () => void;
};

export type Props = {
    initialPrefix?: string;
    shareId: string;
    onAliasSubmit: (values: AliasFormValues) => void;
} & ModalProps;

const initialValues: AliasFormValues = {
    aliasPrefix: '',
    aliasSuffix: undefined,
    mailboxes: [],
};

const AliasModal: FC<Props> = ({ initialPrefix, shareId, onAliasSubmit, ...props }) => {
    const [ready, setReady] = useState(false);

    const form = useFormik<AliasFormValues>({
        initialValues,
        initialErrors: validateAliasForm(initialValues),
        onSubmit: (values) => {
            onAliasSubmit(values);
            props.onClose?.();

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

    const { aliasOptions, aliasOptionsLoading } = useAliasOptions({
        shareId,
        onAliasOptionsLoaded: async (aliasOptions) => {
            const firstSuffix = aliasOptions.suffixes?.[0];
            const firstMailBox = aliasOptions.mailboxes?.[0];

            await form.setValues(
                (values) => ({
                    ...values,
                    ...(firstSuffix && { aliasSuffix: firstSuffix }),
                    ...(firstMailBox && { mailboxes: [firstMailBox] }),
                }),
                true
            );

            setReady(true);
        },
    });

    return (
        <SidebarModal {...props}>
            <Panel
                header={
                    <PanelHeader
                        actions={[
                            <Button
                                key="modal-close-button"
                                className="flex-item-noshrink"
                                icon
                                pill
                                shape="solid"
                                onClick={props.onClose}
                            >
                                <Icon className="modal-close-icon" name="cross-big" alt={c('Action').t`Close`} />
                            </Button>,

                            <Button
                                key="modal-submit-button"
                                onClick={() => form.handleSubmit()}
                                color="norm"
                                pill
                                className=""
                                disabled={!(ready && form.isValid)}
                            >
                                {c('Action').t`Use alias`}
                            </Button>,
                        ]}
                    />
                }
            >
                <FormikProvider value={form}>
                    <AliasForm form={form} aliasOptions={aliasOptions} aliasOptionsLoading={aliasOptionsLoading} />
                </FormikProvider>
            </Panel>
        </SidebarModal>
    );
};

export default AliasModal;
