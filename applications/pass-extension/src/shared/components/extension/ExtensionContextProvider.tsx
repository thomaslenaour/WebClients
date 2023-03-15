import { FC, createContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { noop } from 'lodash';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import { MessageWithSenderFactory, sendMessage } from '@proton/pass/extension/message';
import { selectWorkerAlive } from '@proton/pass/store';
import * as actions from '@proton/pass/store/actions';
import {
    ExtensionEndpoint,
    TabId,
    WorkerMessageResponse,
    WorkerMessageType,
    WorkerMessageWithSender,
    WorkerState,
    WorkerStatus,
} from '@proton/pass/types';
import { workerReady } from '@proton/pass/utils/worker';
import { DEFAULT_LOCALE } from '@proton/shared/lib/constants';
import sentry, { setUID as setSentryUID } from '@proton/shared/lib/helpers/sentry';
import { loadLocale } from '@proton/shared/lib/i18n/loadLocale';
import { initLocales } from '@proton/shared/lib/i18n/locales';

import * as config from '../../../app/config';
import { ExtensionContext } from '../../extension';
import { ExtensionAppContextValue, INITIAL_WORKER_STATE } from './ExtensionContext';

const setup = async (options: {
    tabId: TabId;
    endpoint: ExtensionEndpoint;
    messageFactory: MessageWithSenderFactory;
}): Promise<WorkerMessageResponse<WorkerMessageType.WORKER_WAKEUP>> => {
    const locales = initLocales(require.context('../../../../locales', true, /.json$/, 'lazy'));
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

    const logout = ({ soft }: { soft: boolean }) => {
        setState(INITIAL_WORKER_STATE); /* don't wait for worker response */
        dispatch(actions.signout({ soft }));
    };

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

    return (
        <ExtensionAppContext.Provider value={{ state, ready, logout }}>
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
