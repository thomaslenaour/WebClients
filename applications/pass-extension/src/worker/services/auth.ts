import { c } from 'ttag';

import {
    consumeFork,
    exposeAuthStore,
    getPersistedSession,
    isSessionLocked,
    persistSession,
    resumeSession,
} from '@proton/pass/auth';
import { browserSessionStorage } from '@proton/pass/extension/storage';
import { notification, signout, stateLock } from '@proton/pass/store';
import { Api, WorkerForkMessage, WorkerMessageResponse, WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { withPayload } from '@proton/pass/utils/fp';
import { logger } from '@proton/pass/utils/logger';
import { getApiErrorMessage } from '@proton/shared/lib/api/helpers/apiErrorHelper';
import createAuthenticationStore, {
    AuthenticationStore,
} from '@proton/shared/lib/authentication/createAuthenticationStore';
import { MAIL_APP_NAME, PASS_APP_NAME } from '@proton/shared/lib/constants';
import createStore from '@proton/shared/lib/helpers/store';
import noop from '@proton/utils/noop';

import WorkerMessageBroker from '../channel';
import { withContext } from '../context';
import store from '../store';

/* eslint-disable @typescript-eslint/no-throw-literal */

type LoginOptions = {
    UID: string;
    AccessToken: string;
    RefreshToken: string;
    keyPassword: string;
};
export interface AuthService {
    authStore: AuthenticationStore;
    resumeSession: () => Promise<boolean>;
    consumeFork: (data: WorkerForkMessage['payload']) => Promise<WorkerMessageResponse<WorkerMessageType.FORK>>;
    login: (options: LoginOptions) => Promise<boolean>;
    logout: () => boolean;
    init: () => Promise<boolean>;
    lock: () => void;
    unlock: () => void;
}

type CreateAuthServiceOptions = {
    api: Api;
    onAuthorized?: () => void;
    onUnauthorized?: () => void;
    onSessionLocked?: () => void;
    onSessionUnlocked?: () => void;
};

type AuthContext = {
    pendingInit: Promise<boolean> | null;
    locked: boolean;
};

export const createAuthService = ({
    api,
    onAuthorized,
    onUnauthorized,
    onSessionLocked,
    onSessionUnlocked,
}: CreateAuthServiceOptions): AuthService => {
    const authCtx: AuthContext = {
        pendingInit: null,
        locked: false,
    };

    const authService: AuthService = {
        authStore: exposeAuthStore(createAuthenticationStore(createStore())),

        lock: withContext((ctx) => {
            logger.info(`[Worker::Auth] Locking context`);
            authCtx.locked = true;
            ctx.setStatus(WorkerStatus.LOCKED);
            onSessionLocked?.();
        }),

        unlock: () => {
            logger.info(`[Worker::Auth] Unlocking context`);
            authCtx.locked = false;
            onSessionUnlocked?.();
        },

        init: async () => {
            logger.info(`[Worker::Auth] Initialization start`);

            if (authCtx.pendingInit !== null) {
                logger.info(`[Worker::Auth] Ongoing auth initialization..`);
                return authCtx.pendingInit;
            }

            authCtx.pendingInit = Promise.resolve(
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

            const result = await authCtx.pendingInit;
            authCtx.pendingInit = null;

            return result;
        },
        /**
         * Consumes a session fork request and sends response.
         * Reset api in case it was in an invalid session state.
         * to see full data flow : `applications/account/src/app/content/PublicApp.tsx`
         */
        consumeFork: withContext(async (ctx, data) => {
            api.configure();

            try {
                ctx.setStatus(WorkerStatus.AUTHORIZING);

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
                ctx.setStatus(WorkerStatus.UNAUTHORIZED);
                throw {
                    payload: {
                        title: error.title ?? c('Error').t`Something went wrong`,
                        message: error.message ?? c('Warning').t`Unable to login to ${PASS_APP_NAME}`,
                    },
                };
            }
        }),

        login: withContext(async (ctx, options) => {
            const { UID, keyPassword, AccessToken, RefreshToken } = options;
            await browserSessionStorage.setItems({ UID, keyPassword, AccessToken, RefreshToken });

            api.configure({ UID, AccessToken, RefreshToken });
            api.unsubscribe();

            authService.authStore.setUID(UID);
            authService.authStore.setPassword(keyPassword);

            api.subscribe((event) => {
                switch (event.type) {
                    case 'session': {
                        api.unsubscribe();

                        /* inactive session means user needs to log back in */
                        if (event.status === 'inactive') {
                            store.dispatch(
                                notification({
                                    type: 'error',
                                    text: c('Warning').t`Please log back in`,
                                })
                            );

                            return store.dispatch(signout({ soft: false }));
                        }

                        /* locked session means user needs to enter PIN */
                        if (event.status === 'locked') {
                            authService.lock();

                            store.dispatch(
                                notification({
                                    type: 'error',
                                    text: c('Warning').t`Your session was locked due to inactivity`,
                                })
                            );

                            return store.dispatch(stateLock());
                        }
                    }
                    case 'error': {
                    }
                }
            });

            if (authCtx.locked || (await isSessionLocked())) {
                logger.info(`[Worker::Auth] Detected locked session`);
                authService.lock();

                return false;
            }

            logger.info(`[Worker::Auth] User is authorized`);
            ctx.setStatus(WorkerStatus.AUTHORIZED);
            onAuthorized?.();

            return true;
        }),

        logout: withContext((ctx) => {
            authService.authStore.setUID(undefined);
            authService.authStore.setPassword(undefined);

            api.unsubscribe();
            api.configure();

            ctx.setStatus(WorkerStatus.UNAUTHORIZED);
            onUnauthorized?.();

            return true;
        }),

        resumeSession: withContext(async (ctx) => {
            logger.info(`[Worker::Auth] Trying to resume session`);
            ctx.setStatus(WorkerStatus.RESUMING);

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
                        logger.info(`[Worker::Auth] Session successfuly resumed`);
                        return await authService.login(session);
                    }
                } catch (e) {
                    ctx.setStatus(WorkerStatus.RESUMING_FAILED);
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

            ctx.setStatus(WorkerStatus.UNAUTHORIZED);
            return false;
        }),
    };

    WorkerMessageBroker.registerMessage(WorkerMessageType.FORK, withPayload(authService.consumeFork));
    WorkerMessageBroker.registerMessage(WorkerMessageType.RESUME_SESSION_SUCCESS, withPayload(authService.login));

    return authService;
};
