import browser from 'webextension-polyfill';

import { requestFork } from '@proton/pass/auth';

import * as config from '../../app/config';

export const useNavigateToLogin = () => async () => {
    const url = await requestFork(config.API_URL.replace('/api', ''));
    await browser.tabs.create({ url });
};
