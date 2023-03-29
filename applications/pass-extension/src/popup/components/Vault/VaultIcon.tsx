import type { VFC } from 'react';

import { Icon } from '@proton/components/components';
import { VaultColor as VaultColorEnum, VaultIcon as VaultIconEnum } from '@proton/pass/types/protobuf/vault-v1';
import clsx from '@proton/utils/clsx';

import { VAULT_COLOR_MAP, VAULT_ICON_MAP } from '../../components/Vault/constants';

import './VaultIcon.scss';

type Props = {
    color?: VaultColorEnum;
    icon?: VaultIconEnum;
    size?: 'large' | 'small';
    className?: string;
};

export const VaultIcon: VFC<Props> = ({ icon, color, size = 'large', className }) => (
    <span
        className={clsx([`pass-vault-icon ${size} rounded-50 relative inline-flex flex-justify-center`, className])}
        style={{ '--vault-icon-color': VAULT_COLOR_MAP[color ?? VaultColorEnum.COLOR1] }}
    >
        <Icon
            className="absolute-center"
            name={icon ? VAULT_ICON_MAP[icon] : 'vault'}
            size={size === 'large' ? 22 : 16}
        />
    </span>
);
