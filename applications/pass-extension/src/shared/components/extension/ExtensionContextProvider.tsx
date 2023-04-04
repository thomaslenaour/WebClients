import { type FC, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import { MessageWithSenderFactory, sendMessage } from '@proton/pass/extension/message';
import { selectWorkerAlive } from '@proton/pass/store';
import { sessionLockImmediate, signout } from '@proton/pass/store/actions';
import type {
    ExtensionEndpoint,
    TabId,
    WorkerMessageResponse,
    WorkerMessageWithSender,
    WorkerState,
} from '@proton/pass/types';
import { WorkerMessageType, WorkerStatus } from '@proton/pass/types';
import { workerReady } from '@proton/pass/utils/worker';
import { DEFAULT_LOCALE } from '@proton/shared/lib/constants';
import sentry, { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import { loadLocale } from '@proton/shared/lib/i18n/loadLocale';
import { setLocales } from '@proton/shared/lib/i18n/locales';
import noop from '@proton/utils/noop';

import * as config from '../../../app/config';
import locales from '../../../app/locales';
import { ExtensionContext } from '../../extension';
import { type ExtensionAppContextValue, INITIAL_WORKER_STATE } from './ExtensionContext';

const setup = async (options: {
    tabId: TabId;
    endpoint: ExtensionEndpoint;
    messageFactory: MessageWithSenderFactory;
}): Promise<WorkerMessageResponse<WorkerMessageType.WORKER_WAKEUP>> => {
    /* FIXME: localisation not initialised in
     * content-script, worker or injected frames */
    setLocales(locales);
    await loadLocale(DEFAULT_LOCALE, locales);

    return sendMessage.map(
        options.messageFactory({
            type: WorkerMessageType.WORKER_WAKEUP,
            payload: { tabId: options.tabId },
        }),
        (response) =>
            response.type === 'success'
                ? {
                      loggedIn: response.loggedIn,
                      status: response.status,
                      UID: response.UID,
                      buffered: response.buffered,
                  }
                : INITIAL_WORKER_STATE
    );
};

export const ExtensionAppContext = createContext<ExtensionAppContextValue>({
    state: INITIAL_WORKER_STATE,
    ready: false,
    logout: noop,
    lock: noop,
});

export const ExtensionContextProvider: FC<{
    endpoint: ExtensionEndpoint;
    messageFactory: MessageWithSenderFactory;
    onWorkerMessage?: (message: WorkerMessageWithSender) => void;
}> = ({ endpoint: origin, messageFactory, onWorkerMessage, children }) => {
    useEffect(() => {
        sentry({
            config,
            sentryConfig: {
                host: new URL(config.API_URL).host,
                release: config.APP_VERSION,
                environment: `browser-pass::${origin}`,
            },
            ignore: () => false,
        });
    }, []);

    const dispatch = useDispatch();
    const { tabId } = ExtensionContext.get();

    const [state, setState] = useState<WorkerState>(INITIAL_WORKER_STATE);
    const ready = useSelector(selectWorkerAlive(origin, tabId)) && workerReady(state.status);

    const logout = useCallback(({ soft }: { soft: boolean }) => {
        setState(INITIAL_WORKER_STATE);
        dispatch(signout({ soft }));
    }, []);

    const lock = useCallback(() => {
        setState({ ...INITIAL_WORKER_STATE, status: WorkerStatus.LOCKED });
        dispatch(sessionLockImmediate());
    }, []);

    useEffect(() => {
        const onMessage = (message: WorkerMessageWithSender) => {
            if (message.sender === 'background') {
                if (message.type === WorkerMessageType.WORKER_STATUS) {
                    const { status, loggedIn, UID } = message.payload.state;
                    setState({ status, loggedIn, UID });
                    setSentryUID(UID);
                }

                onWorkerMessage?.(message);
            }
        };

        ExtensionContext.get().port.onMessage.addListener(onMessage);

        setup({ tabId, endpoint: origin, messageFactory })
            .then(({ buffered = [], ...workerState }) => {
                buffered.forEach(onMessage);
                const { UID } = workerState;
                setState(workerState);
                setSentryUID(UID);
            })
            .catch((e) => {
                console.warn(e);
                setState({ loggedIn: false, status: WorkerStatus.ERROR, UID: undefined });
            });

        return () => {
            ExtensionContext.get().port.onMessage.removeListener(onMessage);
        };
    }, []);

    const context = useMemo<ExtensionAppContextValue>(() => ({ state, ready, logout, lock }), [state, ready]);

    return (
        <ExtensionAppContext.Provider value={context}>
            {state.status === WorkerStatus.IDLE ? (
                <div className="anime-fade-in">
                    <CircleLoader />
                </div>
            ) : (
                children
            )}
        </ExtensionAppContext.Provider>
    );
};
