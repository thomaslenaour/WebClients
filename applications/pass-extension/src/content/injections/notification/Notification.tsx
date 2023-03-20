import React, { useEffect, useState } from 'react';

import {
    ConfigProvider,
    Icons,
    NotificationsChildren,
    NotificationsProvider,
    RightToLeftProvider,
} from '@proton/components';
import { Maybe, PromptedFormSubmission } from '@proton/pass/types';
import { pixelEncoder } from '@proton/pass/utils/dom';
import { logger } from '@proton/pass/utils/logger';
import { merge } from '@proton/pass/utils/object';

import * as config from '../../../app/config';
import { ThemeProvider } from '../../../shared/theme/ThemeProvider';
import { NOTIFICATION_HEIGHT, NOTIFICATION_WIDTH } from '../../constants';
import {
    IFrameAppMessageType,
    NotificationAction,
    NotificationIframeMessage,
    NotificationMessageType,
} from '../../types';
import { IFrameMessageBroker } from '../iframe/messages';
import { Autosave } from './views/Autosave';

import './Notification.scss';

type NotificationAppState = {
    action: Maybe<NotificationAction>;
    submission: Maybe<PromptedFormSubmission>;
};

const INITIAL_STATE = { action: undefined, submission: undefined };

const Notification: React.FC = () => {
    const [state, setState] = useState<NotificationAppState>(INITIAL_STATE);

    useEffect(() => {
        IFrameMessageBroker.postMessage<NotificationIframeMessage>({
            origin: 'notification',
            type: IFrameAppMessageType.READY,
        });

        const unsubscribe = IFrameMessageBroker.onContentScriptMessage<NotificationIframeMessage>((message) => {
            logger.debug(`[IFrame::notification]: received "${message.type}"`);
            switch (message.type) {
                case NotificationMessageType.SET_ACTION: {
                    const { payload } = message;
                    return (
                        payload.action === NotificationAction.AUTOSAVE_PROMPT &&
                        setState((state) => merge(state, payload))
                    );
                }
                default:
                    break;
            }
        });

        return unsubscribe;
    }, []);

    return (
        <ConfigProvider config={config}>
            <RightToLeftProvider>
                <Icons />
                <ThemeProvider />
                <NotificationsProvider>
                    <div
                        className="h-custom w-custom bg-norm"
                        style={{
                            '--height-custom': pixelEncoder(NOTIFICATION_HEIGHT),
                            '--width-custom': pixelEncoder(NOTIFICATION_WIDTH),
                        }}
                    >
                        <div className="p1-5 h100">
                            <NotificationsChildren />
                            {state.action === NotificationAction.AUTOSAVE_PROMPT && state.submission !== undefined && (
                                <Autosave
                                    submission={state.submission}
                                    onAutoSaved={() => {
                                        setState(INITIAL_STATE);
                                        IFrameMessageBroker.postMessage({
                                            type: IFrameAppMessageType.CLOSE,
                                            origin: 'notification',
                                        });
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </NotificationsProvider>
            </RightToLeftProvider>
        </ConfigProvider>
    );
};

export default Notification;
