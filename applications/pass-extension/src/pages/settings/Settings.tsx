import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';

import { c } from 'ttag';

import { Avatar } from '@proton/atoms/Avatar';
import { CircleLoader } from '@proton/atoms/CircleLoader';
import { Icon, Tabs, useNotifications } from '@proton/components';
import { pageMessage } from '@proton/pass/extension/message';
import { selectUser } from '@proton/pass/store';
import { Unpack, WorkerMessageType, WorkerMessageWithSender, WorkerStatus } from '@proton/pass/types';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { ExtensionContextProvider, ExtensionWindow } from '../../shared/components/extension';
import { ExtensionHead } from '../../shared/components/page/ExtensionHead';
import { SessionLockConfirmContextProvider } from '../../shared/components/session-lock/SessionLockConfirmContextProvider';
import { ExtensionContext } from '../../shared/extension';
import { useExtensionContext } from '../../shared/hooks';
import createClientStore from '../../shared/store/client-store';
import { Export } from './views/Export';
import { General } from './views/General';
import { Import } from './views/Import';
import { Security } from './views/Security';

type Tab = Unpack<Exclude<ComponentProps<typeof Tabs>['tabs'], undefined>>;

const SETTINGS_TABS: (Tab & { pathname: string })[] = [
    {
        pathname: '/',
        title: c('Label').t`General`,
        content: <General />,
    },
    {
        pathname: '/security',
        title: c('Label').t`Security`,
        content: <Security />,
    },
    {
        pathname: '/import',
        title: c('Label').t`Import`,
        content: <Import />,
    },
    {
        pathname: '/export',
        title: c('Label').t`Export`,
        content: <Export />,
    },
];

const SettingsTabs: FC<{ pathname: string }> = ({ pathname }) => {
    const context = useExtensionContext();
    const user = useSelector(selectUser);

    const pathnameToIndex = (pathname: string) => {
        const idx = SETTINGS_TABS.findIndex((tab) => tab.pathname === pathname);
        return idx !== -1 ? idx : 0;
    };

    const history = useHistory();
    const [activeTab, setActiveTab] = useState<number>(pathnameToIndex(pathname));

    const handleOnChange = (nextTab: number) => history.push(SETTINGS_TABS[nextTab].pathname);

    useEffect(() => {
        setActiveTab(pathnameToIndex(pathname));
    }, [pathname]);

    if (context.state.loggedIn) {
        return (
            <>
                <div className="mb2">
                    <div className="flex flex-align-items-center">
                        <Avatar className="mr1">{user?.DisplayName?.toUpperCase()?.[0]}</Avatar>
                        <span>
                            <span className="block text-ellipsis">{user?.DisplayName}</span>
                            <span className="block text-xs text-ellipsis">{user?.Email}</span>
                        </span>
                    </div>
                </div>
                <Tabs tabs={SETTINGS_TABS} value={activeTab} onChange={handleOnChange} />
            </>
        );
    }

    return (
        <div className="flex flex-justify-center">
            <Icon name="lock-filled" size={42} className="block mb1" />
            {context.state.status === WorkerStatus.LOCKED && (
                <span className="mb1 text-center color-weak">{c('Info')
                    .t`Your ${PASS_APP_NAME} session is locked. Unlock it with your PIN to access the settings`}</span>
            )}
        </div>
    );
};

const SettingsApp: FC = () => {
    const { createNotification } = useNotifications();

    const handleWorkerMessage = useCallback((message: WorkerMessageWithSender) => {
        if (message.type === WorkerMessageType.NOTIFICATION && message.payload.notification.target === 'page') {
            createNotification(message.payload.notification);
        }
    }, []);

    return (
        <ReduxProvider store={createClientStore('page', ExtensionContext.get().tabId)}>
            <HashRouter>
                <ExtensionContextProvider
                    endpoint="page"
                    messageFactory={pageMessage}
                    onWorkerMessage={handleWorkerMessage}
                >
                    <div className="protonpass-lobby" style={{ height: '100vh' }}>
                        <main className="ui-standard w100 relative sign-layout shadow-lifted mw30r max-w100 flex center rounded-lg">
                            <div className="p2 w100">
                                <Switch>
                                    <Route
                                        render={({ location: { pathname } }) => (
                                            <SessionLockConfirmContextProvider>
                                                <SettingsTabs pathname={pathname} />
                                            </SessionLockConfirmContextProvider>
                                        )}
                                    />
                                </Switch>
                            </div>
                        </main>
                    </div>
                </ExtensionContextProvider>
            </HashRouter>
        </ReduxProvider>
    );
};

export const Settings: FC = () => (
    <>
        <ExtensionHead title={c('Title').t`${PASS_APP_NAME} Settings`} />
        <ExtensionWindow endpoint="page">{(ready) => (ready ? <SettingsApp /> : <CircleLoader />)}</ExtensionWindow>
    </>
);
