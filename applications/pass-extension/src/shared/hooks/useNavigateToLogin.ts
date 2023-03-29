import browser from 'webextension-polyfill';

import { requestFork } from '@proton/pass/auth';

import { SSO_URL } from '../../app/config';

export const useNavigateToLogin = () => async () => {
    const url = await requestFork(SSO_URL);
    await browser.tabs.create({ url });
};
