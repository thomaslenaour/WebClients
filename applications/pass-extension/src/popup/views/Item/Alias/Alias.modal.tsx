import { useState } from 'react';

import { type FormikContextType, FormikProvider } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, type ModalProps } from '@proton/components/components';

import { SidebarModal } from '../../../../shared/components/sidebarmodal/SidebarModal';
import { useAliasOptions } from '../../../../shared/hooks/useAliasOptions';
import { PanelHeader } from '../../../components/Panel/Header';
import { Panel } from '../../../components/Panel/Panel';
import { AliasForm } from './Alias.form';
import { AliasFormValues } from './Alias.validation';

export type AliasModalRef = {
    open: () => void;
};

type AliasModalProps<T extends AliasFormValues> = {
    form: FormikContextType<T>;
    handleSubmitClick: () => void;
    shareId: string;
} & ModalProps;

export const AliasModal = <T extends AliasFormValues>({
    form,
    shareId,
    handleSubmitClick,
    ...modalProps
}: AliasModalProps<T>) => {
    const [ready, setReady] = useState(false);

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
        <SidebarModal {...modalProps}>
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
                                onClick={modalProps.onClose}
                            >
                                <Icon className="modal-close-icon" name="cross-big" alt={c('Action').t`Close`} />
                            </Button>,

                            <Button
                                key="modal-submit-button"
                                onClick={handleSubmitClick}
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
                    <AliasForm<T> form={form} aliasOptions={aliasOptions} aliasOptionsLoading={aliasOptionsLoading} />
                </FormikProvider>
            </Panel>
        </SidebarModal>
    );
};
