import { FC, useEffect } from 'react';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import createApi from '@proton/pass/api/create-api';
import { getPersistedSession, resumeSession, setPersistedSession } from '@proton/pass/auth';
import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { browserSessionStorage } from '@proton/pass/extension/storage';
import browser from '@proton/pass/globals/browser';
import { WorkerMessageType } from '@proton/pass/types';

import * as config from '../../../app/config';

/**
 * Temporary extension page to resume a session on start-up.
 * In the startup event listener - when the extension's target API
 * is set to staging - there seems to be an error during the initial SSL
 * handshake (net:ERR_SSL_CLIENT_AUTH_CERT_NEEDED)
 * Mimics the authService::resumeSession data flow
 */
const tryResumeSession = async () => {
    const tab = await browser.tabs.getCurrent();
    const tabId = tab?.id!;

    try {
        const persistedSession = await getPersistedSession();

        if (persistedSession) {
            const api = createApi({
                config,
                auth: {
                    UID: persistedSession.UID,
                    AccessToken: persistedSession.AccessToken,
                    RefreshToken: persistedSession.RefreshToken,
                },
                onSessionRefresh: async ({ AccessToken, RefreshToken }) =>
                    Promise.all([
                        setPersistedSession({ ...persistedSession, AccessToken, RefreshToken }),
                        browserSessionStorage.setItems({ AccessToken, RefreshToken }),
                    ]),
            });

            const session = await resumeSession({ api, session: persistedSession });

            if (session !== undefined) {
                await sendMessage(
                    contentScriptMessage({
                        type: WorkerMessageType.RESUME_SESSION_SUCCESS,
                        payload: session,
                    })
                );
            }
        }
    } finally {
        await browser.tabs.remove(tabId);
    }
};

const ResumeSession: FC = () => {
    useEffect(() => {
        tryResumeSession().catch(console.warn);
    }, []);

    return (
        <div className="protonpass-lobby" style={{ height: '100vh' }}>
            <main className="ui-standard w100 relative sign-layout shadow-lifted mw30r max-w100 flex center rounded-lg">
                <div className="flex p4 w100 flex-column flex-align-items-center">
                    <h3 className="mb1">Signing you back in</h3>
                    <CircleLoader size="large" className="color-primary mb0-5" />
                    <em>Don't close this tab</em>
                </div>
            </main>
        </div>
    );
};

export default ResumeSession;
