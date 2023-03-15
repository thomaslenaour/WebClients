import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';

import { c } from 'ttag';
import browser from 'webextension-polyfill';

import { Avatar } from '@proton/atoms/Avatar';
import { CircleLoader } from '@proton/atoms/CircleLoader';
import { Tabs, useNotifications } from '@proton/components';
import { pageMessage } from '@proton/pass/extension/message';
import { selectUser } from '@proton/pass/store';
import { Unpack, WorkerMessageType, WorkerMessageWithSender } from '@proton/pass/types';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import noop from '@proton/utils/noop';

import { ExtensionContextProvider, ExtensionWindow } from '../../shared/components/extension';
import { ExtensionHead } from '../../shared/components/page/ExtensionHead';
import { useExtensionContext } from '../../shared/hooks';
import createClientStore from '../../shared/store/client-store';
import { Export } from './views/Export';
import { General } from './views/General';
import { Import } from './views/Import';

type Tab = Unpack<Exclude<ComponentProps<typeof Tabs>['tabs'], undefined>>;

const SETTINGS_TABS: (Tab & { pathname: string })[] = [
    {
        pathname: '/',
        title: c('Label').t`General`,
        content: <General />,
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

    useEffect(() => {
        if (!context.state.loggedIn) {
            browser.tabs
                .getCurrent()
                .then((tab) => browser.tabs.remove(tab.id ?? []))
                .catch(noop);
        }
    }, [context]);

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
};

const SettingsApp: FC = () => {
    const { createNotification } = useNotifications();

    const handleWorkerMessage = useCallback((message: WorkerMessageWithSender) => {
        if (message.type === WorkerMessageType.NOTIFICATION && message.payload.notification.target === 'page') {
            const { text, type } = message.payload.notification;
            createNotification({ text, type });
        }
    }, []);

    return (
        <ReduxProvider store={createClientStore('settings', pageMessage)}>
            <HashRouter>
                <ExtensionContextProvider
                    endpoint="page"
                    messageFactory={pageMessage}
                    onWorkerMessage={handleWorkerMessage}
                >
                    <div className="protonpass-lobby protonpass-lobby--full" style={{ height: '100vh' }}>
                        <main className="ui-standard w100 relative sign-layout shadow-lifted mw30r max-w100 flex center rounded-lg">
                            <div className="p2 w100">
                                <Switch>
                                    <Route
                                        render={({ location: { pathname } }) => <SettingsTabs pathname={pathname} />}
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
