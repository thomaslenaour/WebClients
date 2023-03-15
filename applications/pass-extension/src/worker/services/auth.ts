import { c } from 'ttag';

import { consumeFork, exposeAuthStore, getPersistedSession, persistSession, resumeSession } from '@proton/pass/auth';
import { browserSessionStorage } from '@proton/pass/extension/storage';
import { notification, signout } from '@proton/pass/store';
import type { Api, WorkerForkMessage, WorkerMessageResponse } from '@proton/pass/types';
import { WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { logger } from '@proton/pass/utils/logger';
import { getApiErrorMessage } from '@proton/shared/lib/api/helpers/apiErrorHelper';
import createAuthenticationStore, {
    AuthenticationStore,
} from '@proton/shared/lib/authentication/createAuthenticationStore';
import { MAIL_APP_NAME, PASS_APP_NAME } from '@proton/shared/lib/constants';
import createStore from '@proton/shared/lib/helpers/store';
import noop from '@proton/utils/noop';

import WorkerMessageBroker from '../channel';
import WorkerContext from '../context';
import store from '../store';

/* eslint-disable @typescript-eslint/no-throw-literal */
export interface AuthService {
    authStore: AuthenticationStore;
    resumeSession: () => Promise<boolean>;
    consumeFork: (data: WorkerForkMessage['payload']) => Promise<WorkerMessageResponse<WorkerMessageType.FORK>>;
    login: (options: {
        UID: string;
        AccessToken: string;
        RefreshToken: string;
        keyPassword: string;
    }) => Promise<boolean>;
    logout: () => boolean;
    init: () => Promise<boolean>;
}

type CreateAuthServiceOptions = {
    api: Api;
    onAuthorized?: () => void;
    onUnauthorized?: () => void;
};

export const createAuthService = ({ api, onAuthorized, onUnauthorized }: CreateAuthServiceOptions): AuthService => {
    /* safe-guards multiple auth inits */
    let pendingInit: Promise<boolean> | null = null;

    const authService: AuthService = {
        authStore: exposeAuthStore(createAuthenticationStore(createStore())),
        init: async () => {
            logger.info(`[Worker::Auth] Initialization start`);

            if (pendingInit !== null) {
                logger.info(`[Worker::Auth] Ongoing auth initialization..`);
                return pendingInit;
            }

            pendingInit = Promise.resolve(
                (async () => {
                    const { UID, AccessToken, RefreshToken, keyPassword } = await browserSessionStorage.getItems([
                        'UID',
                        'AccessToken',
                        'RefreshToken',
                        'keyPassword',
                    ]);

                    if (UID && keyPassword && AccessToken && RefreshToken) {
                        return authService.login({ UID, keyPassword, AccessToken, RefreshToken });
                    }

                    return authService.resumeSession();
                })()
            );

            const result = await pendingInit;
            pendingInit = null;

            return result;
        },
        /**
         * Consumes a session fork request and sends response
         * to see full data flow : `applications/account/src/app/content/PublicApp.tsx`
         */
        consumeFork: async (data): Promise<WorkerMessageResponse<WorkerMessageType.FORK>> => {
            api.configure(); /** reset api in case it was in an invalid session state */
            const context = WorkerContext.get();

            try {
                context.setStatus(WorkerStatus.AUTHORIZING);

                const { keyPassword } = data;
                const result = await consumeFork({ api, ...data });
                const { AccessToken, RefreshToken } = result;

                await authService.login({
                    UID: result.UID,
                    AccessToken,
                    RefreshToken,
                    keyPassword,
                });

                /* api will have been configured in authService::login */
                await Promise.all([
                    api({ url: `pass/v1/user/access`, method: 'post' }).catch(noop),
                    persistSession(api, result),
                ]);

                return {
                    payload: {
                        title: c('Title').t`Welcome to ${PASS_APP_NAME}`,
                        message: c('Info')
                            .t`More than a password manager, ${PASS_APP_NAME} protects your password and your personal email address via email aliases. Powered by the same technology behind ${MAIL_APP_NAME}, your data is end to end encrypted and is only accessible by you.`,
                    },
                };
            } catch (error: any) {
                context.setStatus(WorkerStatus.UNAUTHORIZED);
                throw {
                    payload: {
                        title: error.title ?? c('Error').t`Something went wrong`,
                        message: error.message ?? c('Warning').t`Unable to login to ${PASS_APP_NAME}`,
                    },
                };
            }
        },
        login: async ({ UID, keyPassword, AccessToken, RefreshToken }) => {
            const context = WorkerContext.get();
            await browserSessionStorage.setItems({ UID, keyPassword, AccessToken, RefreshToken });

            api.configure({ UID, AccessToken, RefreshToken });
            api.unsubscribe();

            authService.authStore.setUID(UID);
            authService.authStore.setPassword(keyPassword);

            api.subscribe((event) => {
                switch (event.type) {
                    case 'invalidated': {
                        api.unsubscribe();

                        store.dispatch(
                            notification({
                                type: 'error',
                                text: c('Warning').t`Please log back in`,
                            })
                        );

                        return store.dispatch(signout({ soft: false }));
                    }
                    default:
                        return;
                }
            });

            context.setStatus(WorkerStatus.AUTHORIZED);
            onAuthorized?.();

            return true;
        },
        logout: () => {
            const context = WorkerContext.get();

            authService.authStore.setUID(undefined);
            authService.authStore.setPassword(undefined);

            api.unsubscribe();
            api.configure();

            context.setStatus(WorkerStatus.UNAUTHORIZED);
            onUnauthorized?.();

            return true;
        },
        resumeSession: async () => {
            const context = WorkerContext.get();

            logger.info(`[Worker] Trying to resume session`);
            context.setStatus(WorkerStatus.RESUMING);

            const persistedSession = await getPersistedSession();

            if (persistedSession) {
                try {
                    /**
                     * Resuming session will most likely happen on browser
                     * start-up before the API has a chance to be configured
                     * through the auth service -> make sure to configure it
                     * with the persisted session authentication parameters
                     * in order for the underlying API calls to succeed and
                     * handle potential token refreshing (ie: persisted access token
                     * expired)
                     */
                    api.configure({
                        UID: persistedSession.UID,
                        AccessToken: persistedSession.AccessToken,
                        RefreshToken: persistedSession.RefreshToken,
                    });

                    const session = await resumeSession({ session: persistedSession, api });

                    if (session !== undefined) {
                        logger.info(`[Worker] Session successfuly resumed`);
                        await authService.login(session);
                        return true;
                    }
                } catch (e) {
                    context.setStatus(WorkerStatus.RESUMING_FAILED);
                    const description = e instanceof Error ? getApiErrorMessage(e) ?? e?.message : '';

                    store.dispatch(
                        notification({
                            type: 'error',
                            text: c('Error').t`Could not resume your session : ${description}`,
                        })
                    );

                    return false;
                }
            }

            context.setStatus(WorkerStatus.UNAUTHORIZED);
            return false;
        },
    };

    WorkerMessageBroker.registerMessage(WorkerMessageType.FORK, (message) => authService.consumeFork(message.payload));

    WorkerMessageBroker.registerMessage(WorkerMessageType.RESUME_SESSION_SUCCESS, (message) =>
        authService.login(message.payload)
    );

    return authService;
};
