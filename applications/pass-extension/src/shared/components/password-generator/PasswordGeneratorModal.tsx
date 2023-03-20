import { FC } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { useNotifications } from '@proton/components';
import Modal, { ModalProps } from '@proton/components/components/modalTwo/Modal';
import ModalContent from '@proton/components/components/modalTwo/ModalContent';
import ModalFooter from '@proton/components/components/modalTwo/ModalFooter';
import ModalHeader from '@proton/components/components/modalTwo/ModalHeader';
import { textToClipboard } from '@proton/shared/lib/helpers/browser';

import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
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
        <Modal size="small" {...props}>
            <ModalHeader title={c('Label').t`Generate password`} />
            <ModalContent>
                <PasswordGenerator {...passwordGenerator} standalone />
            </ModalContent>
            <ModalFooter>
                <Button onClick={props.onClose}>{c('Action').t`Cancel`}</Button>
                {allowCopyToClipboard && (
                    <Button onClick={handleCopy} color="norm">
                        {c('Action').t`Copy and close`}
                    </Button>
                )}
                {action && (
                    <Button onClick={() => action.onSubmit(passwordGenerator.password)} color="norm">
                        {action.label}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};
