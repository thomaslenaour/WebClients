import { type FC, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { c } from 'ttag';

import { CircleLoader } from '@proton/atoms/CircleLoader';
import { NotificationsContext } from '@proton/components';
import { useNotifications } from '@proton/components/hooks';
import { popupMessage } from '@proton/pass/extension/message';
import { selectWorkerSyncing, syncIntent } from '@proton/pass/store';
import * as requests from '@proton/pass/store/actions/requests';
import { WorkerMessageType, type WorkerMessageWithSender, WorkerStatus } from '@proton/pass/types';

import { ExtensionContextProvider } from '../../../shared/components/extension';
import { ExtensionContext } from '../../../shared/extension';
import { useExtensionContext } from '../../../shared/hooks';
import { useRequestStatusEffect } from '../../../shared/hooks/useRequestStatusEffect';
import { PopupContext, type PopupContextValue } from './PopupContext';

/**
 * PopupContext is an extension of the base
 * ExtensionContext adding specifics for handling
 * syncing behaviours & active tab data.
 */
const ExtendedExtensionContext: FC = ({ children }) => {
    const extensionContext = useExtensionContext();
    const notificationsManager = useContext(NotificationsContext);
    const { createNotification } = useNotifications();
    useEffect(() => notificationsManager.setOffset({ y: 10 }), []);

    const dispatch = useDispatch();
    const syncing = useSelector(selectWorkerSyncing) || extensionContext.state.status === WorkerStatus.BOOTING;
    const ready = extensionContext.ready && !syncing;

    const { realm, subdomain } = ExtensionContext.get();

    useRequestStatusEffect(requests.syncing(), {
        onStart: () =>
            createNotification({
                key: requests.syncing(),
                showCloseButton: false,
                text: (
                    <>
                        {c('Info').t`Syncing your vaults…`} <CircleLoader />
                    </>
                ),
            }),
    });

    const popupContext = useMemo<PopupContextValue>(() => {
        const { state, logout, lock } = extensionContext;

        return {
            state,
            ready,
            logout,
            lock,
            sync: () => dispatch(syncIntent({})),
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
            clearNotifications();
            createNotification(message.payload.notification);
        }
    };

    return (
        <ExtensionContextProvider endpoint="popup" messageFactory={popupMessage} onWorkerMessage={onWorkerMessage}>
            <ExtendedExtensionContext>{children}</ExtendedExtensionContext>
        </ExtensionContextProvider>
    );
};
