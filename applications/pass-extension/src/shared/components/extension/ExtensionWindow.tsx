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
import { ExtensionEndpoint } from '@proton/pass/types';

import * as config from '../../../app/config';
import { setupExtensionContext } from '../../extension/context';
import { ThemeProvider } from '../../theme/ThemeProvider';

export const ExtensionWindow: FC<{
    endpoint: ExtensionEndpoint;
    className?: string;
    style?: CSSProperties;
    children: (ready: boolean) => ReactNode;
}> = ({ endpoint, style, className, children }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setupExtensionContext({ endpoint, onDisconnect: () => window.location.reload() })
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
