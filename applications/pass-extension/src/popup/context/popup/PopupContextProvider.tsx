import { FC, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { NotificationsContext } from '@proton/components';
import { useNotifications } from '@proton/components/hooks';
import { popupMessage } from '@proton/pass/extension/message';
import { selectWorkerSyncing, syncIntent } from '@proton/pass/store';
import { WorkerMessageType, WorkerMessageWithOrigin, WorkerStatus } from '@proton/pass/types';

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
    const sync = useCallback(() => dispatch(syncIntent({})), [syncing]);

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
        <PopupContext.Provider
            value={{
                state,
                ready,
                sync,
                logout,
                realm: realm ?? undefined,
                subdomain: subdomain ?? undefined,
            }}
        >
            {children}
        </PopupContext.Provider>
    );
};

export const PopupContextProvider: FC = ({ children }) => {
    const { createNotification, clearNotifications } = useNotifications();

    const onWorkerMessage = (message: WorkerMessageWithOrigin) => {
        if (message.type === WorkerMessageType.NOTIFICATION) {
            const { text, type } = message.payload.notification;
            clearNotifications();
            createNotification({ text, type });
        }
    };

    return (
        <ExtensionContextProvider origin="popup" messageFactory={popupMessage} onWorkerMessage={onWorkerMessage}>
            <ExtendedExtensionContext>{children}</ExtendedExtensionContext>
        </ExtensionContextProvider>
    );
};
