import { FC, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { NotificationsContext } from '@proton/components';
import { useNotifications } from '@proton/components/hooks';
import { popupMessage } from '@proton/pass/extension/message';
import { selectWorkerSyncing, sessionLockImmediate, syncIntent } from '@proton/pass/store';
import { WorkerMessageType, WorkerMessageWithSender, WorkerStatus } from '@proton/pass/types';

import { ExtensionContextProvider } from '../../../shared/components/extension';
import { ExtensionContext } from '../../../shared/extension';
import { useExtensionContext } from '../../../shared/hooks';
import { PopupContext } from './PopupContext';

/**
 * PopupContext is an extension of the base
 * ExtensionContext adding specifics for handling
 * syncing behaviours & active tab data.
 */
const ExtendedExtensionContext: FC = ({ children }) => {
    const { state, ready: extensionContextReady, logout } = useExtensionContext();
    const history = useHistory();
    const dispatch = useDispatch();

    const syncing = useSelector(selectWorkerSyncing) || state.status === WorkerStatus.BOOTING;

    /* SESSION LOCK START */
    const sync = useCallback(() => dispatch(syncIntent({})), []);
    const lock = useCallback(() => dispatch(sessionLockImmediate()), []);
    /* SESSION LOCK END */

    useEffect(() => {
        if (syncing) {
            history.replace('/syncing');
        }
    }, [syncing]);

    const ready = extensionContextReady && !syncing;
    const { realm, subdomain } = ExtensionContext.get();

    const notificationsManager = useContext(NotificationsContext);
    useEffect(() => notificationsManager.setOffset({ y: 10 }), []);

    return (
        /* SESSION LOCK START */
        <PopupContext.Provider
            value={{
                state,
                ready,
                sync,
                logout,
                lock,
                realm: realm ?? undefined,
                subdomain: subdomain ?? undefined,
            }}
        >
            {children}
        </PopupContext.Provider>
        /* SESSION LOCK END */
    );
};

export const PopupContextProvider: FC = ({ children }) => {
    const { createNotification, clearNotifications } = useNotifications();

    const onWorkerMessage = (message: WorkerMessageWithSender) => {
        if (message.type === WorkerMessageType.NOTIFICATION) {
            const { text, type } = message.payload.notification;
            clearNotifications();
            createNotification({ text, type });
        }
    };

    return (
        <ExtensionContextProvider endpoint="popup" messageFactory={popupMessage} onWorkerMessage={onWorkerMessage}>
            <ExtendedExtensionContext>{children}</ExtendedExtensionContext>
        </ExtensionContextProvider>
    );
};
