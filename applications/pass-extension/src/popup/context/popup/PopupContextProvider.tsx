import { FC, useContext, useEffect, useMemo } from 'react';
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
import { PopupContext, PopupContextValue } from './PopupContext';

/**
 * PopupContext is an extension of the base
 * ExtensionContext adding specifics for handling
 * syncing behaviours & active tab data.
 */
const ExtendedExtensionContext: FC = ({ children }) => {
    const extensionContext = useExtensionContext();
    const history = useHistory();
    const dispatch = useDispatch();

    const syncing = useSelector(selectWorkerSyncing) || extensionContext.state.status === WorkerStatus.BOOTING;
    const ready = extensionContext.ready && !syncing;

    useEffect(() => {
        if (syncing) {
            history.replace('/syncing');
        }
    }, [syncing]);

    const { realm, subdomain } = ExtensionContext.get();

    const notificationsManager = useContext(NotificationsContext);
    useEffect(() => notificationsManager.setOffset({ y: 10 }), []);

    const popupContext = useMemo<PopupContextValue>(() => {
        const { state, logout } = extensionContext;
        return {
            state,
            ready,
            logout,
            sync: () => dispatch(syncIntent({})),
            lock: () => dispatch(sessionLockImmediate()),
            realm: realm ?? undefined,
            subdomain: subdomain ?? undefined,
        };
    }, [extensionContext, ready]);

    return <PopupContext.Provider value={popupContext}>{children}</PopupContext.Provider>;
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
