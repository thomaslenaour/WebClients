import type { IconName } from '@proton/components/components';
import type { ColorRGB } from '@proton/pass/types';
import { VaultColor, VaultIcon } from '@proton/pass/types/protobuf/vault-v1';

const numericEntries = <T extends Record<number, any>>(
    obj: T
): [number, T extends Record<any, infer U> ? U : never][] =>
    Object.keys(obj).map((key) => [Number(key), obj[Number(key)]]);

export const VAULT_COLOR_MAP: Record<number, ColorRGB> = {
    [VaultColor.COLOR1]: '167 121 255',
    [VaultColor.COLOR2]: '242 146 146',
    [VaultColor.COLOR3]: '247 215 117',
    [VaultColor.COLOR4]: '145 199 153',
    [VaultColor.COLOR5]: '146 179 242',
    [VaultColor.COLOR6]: '235 141 214',
    [VaultColor.COLOR7]: '205 90 111',
    [VaultColor.COLOR8]: '228 163 103',
    [VaultColor.COLOR9]: '230 230 230',
    [VaultColor.COLOR10]: '158 226 230',
};

export const VAULT_COLORS = numericEntries(VAULT_COLOR_MAP);

export const VAULT_ICON_MAP: Record<number, IconName> = {
    [VaultIcon.ICON1]: 'pass-house',
    [VaultIcon.ICON2]: 'pass-cheque',
    [VaultIcon.ICON3]: 'pass-shop',
    [VaultIcon.ICON4]: 'pass-palm-tree',
    [VaultIcon.ICON5]: 'pass-savings' /* ⁇ */,
    [VaultIcon.ICON6]: 'pass-discount',
    [VaultIcon.ICON7]: 'pass-run-shoes',
    [VaultIcon.ICON8]: 'pass-chef',
    [VaultIcon.ICON9]: 'pass-shopping-bag',
    [VaultIcon.ICON10]: 'pass-super-mushroom',
    [VaultIcon.ICON11]: 'pass-wallet',
    [VaultIcon.ICON12]: 'pass-hacker',
    [VaultIcon.ICON13]: 'pass-present',
    [VaultIcon.ICON14]: 'pass-medal',
    [VaultIcon.ICON15]: 'pass-teddy-bear',
    [VaultIcon.ICON16]: 'pass-pacman',
    [VaultIcon.ICON17]: 'pass-shield',
    [VaultIcon.ICON18]: 'pass-bookmark',
    [VaultIcon.ICON19]: 'pass-witch-hat',
    [VaultIcon.ICON20]: 'pass-atom',
    [VaultIcon.ICON21]: 'pass-briefcase',
    [VaultIcon.ICON22]: 'pass-love',
    [VaultIcon.ICON23]: 'pass-chemistry',
    [VaultIcon.ICON24]: 'pass-grain',
    [VaultIcon.ICON25]: 'pass-credit-card',
    [VaultIcon.ICON26]: 'pass-router',
    [VaultIcon.ICON27]: 'pass-volleyball',
    [VaultIcon.ICON28]: 'pass-baby',
    [VaultIcon.ICON29]: 'pass-alien',
    [VaultIcon.ICON30]: 'pass-car',
};

export const VAULT_ICONS = numericEntries(VAULT_ICON_MAP);
