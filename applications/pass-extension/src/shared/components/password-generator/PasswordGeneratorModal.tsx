import { FC } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, useNotifications } from '@proton/components';
import { ModalProps } from '@proton/components/components/modalTwo/Modal';
import { textToClipboard } from '@proton/shared/lib/helpers/browser';

import { ItemHeader } from '../../../popup/components/Panel/ItemPanelHeader';
import { Panel } from '../../../popup/components/Panel/Panel';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import { SidebarModal } from '../sidebarmodal/SidebarModal';
import { PasswordGenerator } from './PasswordGenerator';

type PasswordGeneratorModalProps = ModalProps & {
    allowCopyToClipboard?: boolean;
    action?: { label: string; onSubmit: (password: string) => void };
};

export const PasswordGeneratorModal: FC<PasswordGeneratorModalProps> = ({
    allowCopyToClipboard = false,
    action,
    ...props
}) => {
    const passwordGenerator = usePasswordGenerator();
    const { createNotification } = useNotifications();

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        textToClipboard(passwordGenerator.password, e.currentTarget);
        createNotification({ type: 'success', text: c('Info').t`Copied to clipboard` });
        props.onClose?.();
    };

    return (
        <SidebarModal className="ui-password" {...props}>
            <Panel
                header={
                    // no type "password" available
                    <ItemHeader
                        type="alias"
                        actions={[
                            <Button className="flex-item-noshrink" icon pill shape="solid" onClick={props.onClose}>
                                <Icon className="modal-close-icon" name="cross-big" alt={c('Action').t`Close`} />
                            </Button>,
                            allowCopyToClipboard ? (
                                <Button onClick={handleCopy} color="norm" pill>
                                    {c('Action').t`Copy and close`}
                                </Button>
                            ) : undefined,
                        ]}
                    />
                }
            >
                <PasswordGenerator {...passwordGenerator} standalone />
                {action && (
                    <Button onClick={() => action.onSubmit(passwordGenerator.password)} color="norm">
                        {action.label}
                    </Button>
                )}
            </Panel>
        </SidebarModal>
    );
};
