import { AuthenticationStore } from '@proton/shared/lib/authentication/createAuthenticationStore';

export let authentication: AuthenticationStore;

export const initAuthentication = (value: AuthenticationStore) => {
    authentication = value;
};
