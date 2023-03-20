import { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';

import {
    ConfigProvider,
    Icons,
    ModalsChildren,
    ModalsProvider,
    NotificationsChildren,
    NotificationsProvider,
    RightToLeftProvider,
} from '@proton/components';
import { Portal } from '@proton/components/components/portal';

import * as config from '../../../app/config';
import { setupExtensionContext } from '../../extension/context';
import { ThemeProvider } from '../../theme/ThemeProvider';

export const ExtensionWindow: FC<{
    id: string;
    className?: string;
    style?: CSSProperties;
    children: (ready: boolean) => ReactNode;
}> = ({ id, style, className, children }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setupExtensionContext({ origin: id, onDisconnect: () => window.location.reload() })
            .then(() => setReady(true))
            .catch(console.warn);
    }, []);

    return (
        <>
            <div style={style} className={className}>
                <ConfigProvider config={config}>
                    <RightToLeftProvider>
                        <Icons />
                        <ThemeProvider />
                        <NotificationsProvider>
                            <ModalsProvider>
                                {children(ready)}
                                <Portal>
                                    <ModalsChildren />
                                    <NotificationsChildren />
                                </Portal>
                            </ModalsProvider>
                        </NotificationsProvider>
                    </RightToLeftProvider>
                </ConfigProvider>
            </div>
        </>
    );
};
