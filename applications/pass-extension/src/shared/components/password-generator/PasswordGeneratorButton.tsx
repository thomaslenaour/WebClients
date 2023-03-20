import { useState } from 'react';

import { c } from 'ttag';

import { Button, ButtonProps } from '@proton/atoms';
import { Icon, Tooltip } from '@proton/components/components';

import { PasswordGeneratorModal } from './PasswordGeneratorModal';

type PasswordGeneratorButtonProps = ButtonProps & { onDone: (password: string) => void };

export const PasswordGeneratorButton = ({ onDone, ...rest }: PasswordGeneratorButtonProps) => {
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const onSubmit = (password: string) => {
        onDone(password);
        setPasswordModalOpen(false);
    };

    return (
        <>
            <Tooltip title={c('Action').t`Generate password`}>
                <Button icon onClick={() => setPasswordModalOpen(true)} {...rest}>
                    <Icon name="arrows-rotate" />
                </Button>
            </Tooltip>

            <PasswordGeneratorModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                action={{ label: c('Action').t`Use password`, onSubmit }}
            />
        </>
    );
};
