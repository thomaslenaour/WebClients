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
    [VaultIcon.ICON1]: 'pass-alien',
    [VaultIcon.ICON2]: 'pass-atom',
    [VaultIcon.ICON3]: 'pass-baby',
    [VaultIcon.ICON4]: 'pass-bookmark',
    [VaultIcon.ICON5]: 'pass-briefcase',
    [VaultIcon.ICON6]: 'pass-car',
    [VaultIcon.ICON7]: 'pass-chemistry',
    [VaultIcon.ICON8]: 'pass-cheque',
    [VaultIcon.ICON9]: 'pass-chef',
    [VaultIcon.ICON10]: 'pass-credit-card',
    [VaultIcon.ICON11]: 'pass-discount',
    [VaultIcon.ICON12]: 'pass-grain',
    [VaultIcon.ICON13]: 'pass-hacker',
    [VaultIcon.ICON14]: 'pass-house',
    [VaultIcon.ICON15]: 'pass-love',
    [VaultIcon.ICON16]: 'pass-medal',
    [VaultIcon.ICON17]: 'pass-pacman',
    [VaultIcon.ICON18]: 'pass-palm-tree',
    [VaultIcon.ICON19]: 'pass-present',
    [VaultIcon.ICON20]: 'pass-router',
    [VaultIcon.ICON21]: 'pass-run-shoes',
    [VaultIcon.ICON22]: 'pass-savings',
    [VaultIcon.ICON23]: 'pass-shield',
    [VaultIcon.ICON24]: 'pass-shop',
    [VaultIcon.ICON25]: 'pass-shopping-bag',
    [VaultIcon.ICON26]: 'pass-super-mushroom',
    [VaultIcon.ICON27]: 'pass-teddy-bear',
    [VaultIcon.ICON28]: 'pass-volleyball',
    [VaultIcon.ICON29]: 'pass-wallet',
    [VaultIcon.ICON30]: 'pass-witch-hat',
};

export const VAULT_ICONS = numericEntries(VAULT_ICON_MAP);
