import { type VFC, useCallback, useEffect } from 'react';

import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon } from '@proton/components';
import type { ModalProps } from '@proton/components/components/modalTwo/Modal';

import { SidebarModal } from '../../../shared/components/sidebarmodal/SidebarModal';
import { usePasswordGenerator } from '../../../shared/hooks';
import { PanelHeader } from '../Panel/Header';
import { Panel } from '../Panel/Panel';
import { PasswordGenerator } from './PasswordGenerator';

export type BaseProps = { actionLabel?: string; className?: string; onSubmit?: (password: string) => void };
export type Props = Omit<ModalProps, 'onSubmit'> & BaseProps;

export const PasswordGeneratorModal: VFC<Props> = ({ onSubmit, actionLabel, ...props }) => {
    const passwordGenerator = usePasswordGenerator();
    const handleActionClick = useCallback(() => onSubmit?.(passwordGenerator.password), [passwordGenerator, onSubmit]);

    useEffect(() => {
        if (props.open) {
            /* regenerate on each modal opening */
            passwordGenerator.regeneratePassword();
        }
    }, [props.open]);

    return (
        <SidebarModal {...props}>
            <Panel
                header={
                    <PanelHeader
                        actions={[
                            <Button className="flex-item-noshrink" icon pill shape="solid" onClick={props.onClose}>
                                <Icon className="modal-close-icon" name="cross-big" alt={c('Action').t`Close`} />
                            </Button>,
                            <div className="flex gap-x-2">
                                {actionLabel && (
                                    <Button onClick={handleActionClick} color="norm" pill className="">
                                        {actionLabel}
                                    </Button>
                                )}
                                <Button
                                    icon
                                    pill
                                    shape="solid"
                                    className="flex-item-noshrink"
                                    onClick={passwordGenerator.regeneratePassword}
                                >
                                    <Icon name="arrow-rotate-right" alt={c('Action').t`Regenerate`} />
                                </Button>
                            </div>,
                        ]}
                    />
                }
            >
                <PasswordGenerator {...passwordGenerator} standalone />
            </Panel>
        </SidebarModal>
    );
};
