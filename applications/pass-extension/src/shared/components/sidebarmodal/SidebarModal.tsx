import { FC } from 'react';

import { ModalProps, ModalTwo } from '@proton/components';

import './SidebarModal.scss';

export const SidebarModal: FC<ModalProps> = ({ children, className, ...props }) => {
    return (
        <ModalTwo rootClassName="pass-modal-two--sidebar" className={className} {...props}>
            <div className="px-4 py-3 overflow-auto">{children}</div>
        </ModalTwo>
    );
};
