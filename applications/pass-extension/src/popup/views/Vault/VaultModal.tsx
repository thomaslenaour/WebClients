import { FC, useMemo, useRef, useState } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Icon, type ModalProps } from '@proton/components/components';
import type { VaultShare } from '@proton/pass/types';
import { pipe, tap } from '@proton/pass/utils/fp';
import noop from '@proton/utils/noop';

import { SidebarModal } from '../../../shared/components/sidebarmodal/SidebarModal';
import { PanelHeader } from '../../components/Panel/Header';
import { Panel } from '../../components/Panel/Panel';
import { VaultEdit } from './Vault.edit';
import { VaultFormHandle } from './Vault.form';
import { VaultNew } from './Vault.new';

export type Props = {
    payload:
        | { type: 'new' }
        | {
              type: 'edit';
              vault: VaultShare;
          };
} & ModalProps;

export const VaultModal: FC<Props> = ({ payload, ...props }) => {
    const [loading, setLoading] = useState(false);
    const vaultFormRef = useRef<VaultFormHandle>(null);

    const vaultViewProps = useMemo(
        () => ({
            onSubmit: () => setLoading(false),
            onFailure: () => setLoading(false),
            onSuccess: pipe(
                props.onClose ?? noop,
                tap(() => setLoading(false))
            ),
        }),
        []
    );

    return (
        <SidebarModal {...props}>
            <Panel
                header={
                    <PanelHeader
                        actions={[
                            <Button className="flex-item-noshrink" icon pill shape="solid" onClick={props.onClose}>
                                <Icon className="modal-close-icon" name="cross-big" alt={c('Action').t`Close`} />
                            </Button>,

                            <Button
                                onClick={() => vaultFormRef?.current?.submit()}
                                color="norm"
                                pill
                                loading={loading}
                                disabled={loading}
                            >
                                {payload.type === 'new' && c('Action').t`Create vault`}
                                {payload.type === 'edit' && c('Action').t`Save`}
                            </Button>,
                        ]}
                    />
                }
            >
                {payload.type === 'new' && <VaultNew ref={vaultFormRef} {...vaultViewProps} />}
                {payload.type === 'edit' && <VaultEdit vault={payload.vault} ref={vaultFormRef} {...vaultViewProps} />}
            </Panel>
        </SidebarModal>
    );
};
