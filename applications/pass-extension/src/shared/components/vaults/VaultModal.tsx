import { useCallback } from 'react';
import { FC, useMemo, useState } from 'react';
import { useRef } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Card } from '@proton/atoms/Card';
import { ModalProps, ModalTwo, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '@proton/components/components';
import { VaultShare } from '@proton/pass/types';
import { pipe, tap } from '@proton/pass/utils/fp';
import noop from '@proton/utils/noop';

import { VaultEdit } from './Vault.edit';
import { VaultNew } from './Vault.new';
import { VaultFormHandle } from './types';

export type VaultModalProps = {
    payload:
        | { type: 'new' }
        | {
              type: 'edit';
              vault: VaultShare;
          };
} & ModalProps;

const getDescriptors = (payload: VaultModalProps['payload']) => {
    switch (payload.type) {
        case 'edit': {
            const vaultName = payload.vault.content.name;
            return {
                title: c('Title').t`Edit vault ${vaultName}`,
                action: c('Action').t`Save`,
            };
        }
        case 'new': {
            return {
                title: c('Title').t`Create new vault`,
                assistiveText: c('Info')
                    .t`A vault is like a folder for your items. Pick a name that will help you remember what kind of items you'd like to store in this particular vault.`,
                action: c('Action').t`Create vault`,
            };
        }
    }
};

export const VaultModal: FC<VaultModalProps> = ({ payload, ...modalProps }) => {
    const { title, action, assistiveText } = useMemo(() => getDescriptors(payload), [payload]);
    const [loading, setLoading] = useState(false);
    const vaultFormRef = useRef<VaultFormHandle>(null);

    const onSubmit = useCallback(() => setLoading(true), []);
    const onFailure = useCallback(() => setLoading(false), []);
    const onSuccess = useCallback(
        pipe(
            modalProps.onClose ?? noop,
            tap(() => setLoading(false))
        ),
        []
    );

    let innerContent = null;
    switch (payload.type) {
        case 'new':
            innerContent = (
                <VaultNew onSubmit={onSubmit} onFailure={onFailure} onSuccess={onSuccess} ref={vaultFormRef} />
            );
            break;
        case 'edit':
            innerContent = (
                <VaultEdit
                    vault={payload.vault}
                    onSubmit={onSubmit}
                    onFailure={onFailure}
                    onSuccess={onSuccess}
                    ref={vaultFormRef}
                />
            );
            break;
    }

    return (
        <ModalTwo {...modalProps} size="small">
            <ModalTwoHeader title={title} />
            <ModalTwoContent>
                {assistiveText && (
                    <Card rounded className="text-sm mb1">
                        {assistiveText}
                    </Card>
                )}
                {innerContent}
            </ModalTwoContent>
            <ModalTwoFooter>
                <Button
                    fullWidth
                    color="norm"
                    loading={loading}
                    disabled={loading}
                    className="mt1"
                    onClick={() => vaultFormRef?.current?.submit()}
                >
                    {action}
                </Button>
            </ModalTwoFooter>
        </ModalTwo>
    );
};
