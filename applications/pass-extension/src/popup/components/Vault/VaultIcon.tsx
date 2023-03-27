import type { VFC } from 'react';

import { Icon } from '@proton/components/components';
import { VaultColor as VaultColorEnum, VaultIcon as VaultIconEnum } from '@proton/pass/types/protobuf/vault-v1';

import { VAULT_COLOR_MAP, VAULT_ICON_MAP } from '../../components/Vault/constants';

import './VaultIcon.scss';

type Props = {
    color: VaultColorEnum;
    icon: VaultIconEnum;
    size?: 'large' /* FIXME: add more when needed */;
};

export const VaultIcon: VFC<Props> = ({ icon, color, size = 'large' }) => (
    <span
        className={`pass-vault-icon ${size} rounded-50 relative inline-flex flex-justify-center`}
        style={{ '--vault-icon-color': VAULT_COLOR_MAP[color] }}
    >
        <Icon name={VAULT_ICON_MAP[icon]} className="absolute-center" size={24} />
    </span>
);
