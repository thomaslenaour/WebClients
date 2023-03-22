import { type VFC, memo, useState } from 'react';

import { c } from 'ttag';

import { Button, type ButtonProps } from '@proton/atoms';
import { Icon } from '@proton/components/components';

import { PasswordGeneratorModal } from './PasswordGeneratorModal';

type Props = ButtonProps & { onDone: (password: string) => void };

const PasswordGeneratorButtonRaw: VFC<Props> = ({ onDone, ...rest }) => {
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const onSubmit = (password: string) => {
        onDone(password);
        setPasswordModalOpen(false);
    };

    return (
        <>
            <Button
                icon
                pill
                color="weak"
                shape="solid"
                size="small"
                className="pass-item-icon"
                title={c('Action').t`Generate password`}
                onClick={() => setPasswordModalOpen(true)}
                {...rest}
            >
                <Icon name="arrows-rotate" size={24} />
            </Button>

            <PasswordGeneratorModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                action={{ label: c('Action').t`Use password`, onSubmit }}
            />
        </>
    );
};

export const PasswordGeneratorButton = memo(PasswordGeneratorButtonRaw);
