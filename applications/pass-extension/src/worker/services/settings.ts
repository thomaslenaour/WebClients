import browser from 'webextension-polyfill';

import { logger } from '@proton/pass/utils/logger';

type ExtensionSetting = {
    id: string;
    platform: 'all' | 'chrome' | 'firefox';
    default: boolean;
    set: (value: boolean) => Promise<void>;
    get: () => Promise<boolean>;
};

const createExtensionSetting = (id: string, setting: browser.Types.Setting): ExtensionSetting => {
    return {
        id,
        platform: 'all',
        default: false,
        set: async (value: boolean) => {
            try {
                const { levelOfControl } = await setting.get({});
                if (
                    levelOfControl === 'controlled_by_this_extension' ||
                    levelOfControl === 'controllable_by_this_extension'
                ) {
                    await setting.set({ value });
                }
            } catch (e) {
                logger.warn(e);
            }
        },
        get: async () => (await setting.get({})).value,
    };
};

export type SettingsService = ReturnType<typeof createSettingsService>;

export const createSettingsService = () => {
    const settings = [createExtensionSetting('passwordSavingEnabled', browser.privacy.services.passwordSavingEnabled)];

    const init = async () => {
        for (const setting of settings) {
            await setting.set(setting.default);
        }
    };

    return { init };
};
