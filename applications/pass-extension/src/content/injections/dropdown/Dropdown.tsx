import { useEffect, useMemo, useRef, useState } from 'react';

import { c } from 'ttag';

import { ConfigProvider, Icons, RightToLeftProvider } from '@proton/components';
import { AliasState } from '@proton/pass/store';
import { Realm, SafeLoginItem, WorkerState, WorkerStatus } from '@proton/pass/types';
import { pixelEncoder } from '@proton/pass/utils/dom';
import { logger } from '@proton/pass/utils/logger';
import { merge } from '@proton/pass/utils/object';
import { BRAND_NAME, PASS_APP_NAME } from '@proton/shared/lib/constants';

import * as config from '../../../app/config';
import { useNavigateToLogin } from '../../../shared/hooks';
import { ThemeProvider } from '../../../shared/theme/ThemeProvider';
import { DropdownAction, DropdownIframeMessage, DropdownMessageType } from '../../types';
import { IFrameAppMessageType } from '../../types/iframe';
import { IFrameMessageBroker } from '../iframe/messages';
import { DropdownItem } from './components/DropdownItem';
import { AliasAutoSuggest } from './views/AliasAutoSuggest';
import { ItemsList } from './views/ItemsList';
import { PasswordAutoSuggest } from './views/PasswordAutoSuggest';

import './Dropdown.scss';

export type DropdownState = Pick<WorkerState, 'loggedIn' | 'status'> & {
    action?: DropdownAction;
    items: SafeLoginItem[];
    aliasOptions: AliasState['aliasOptions'];
    realm: Realm;
};

const Dropdown: React.FC = () => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigateToLogin = useNavigateToLogin();

    const [state, setState] = useState<DropdownState>({
        loggedIn: false,
        status: WorkerStatus.IDLE,
        action: undefined,
        items: [],
        aliasOptions: null,
        realm: '',
    });

    const handleAction = (
        payload: Extract<DropdownIframeMessage, { type: DropdownMessageType.SET_ACTION }>['payload']
    ) => {
        switch (payload.action) {
            case DropdownAction.AUTOFILL:
                return setState((state) => merge(state, payload));
            case DropdownAction.AUTOSUGGEST_PASSWORD:
                return setState((state) => merge(state, { items: [], action: payload.action }));
            case DropdownAction.AUTOSUGGEST_ALIAS:
                return setState((state) =>
                    merge(state, {
                        items: [],
                        action: payload.action,
                        aliasOptions: payload.options,
                        realm: payload.realm,
                    })
                );
        }
    };

    useEffect(() => {
        IFrameMessageBroker.postMessage<DropdownIframeMessage>({
            sender: 'dropdown',
            type: IFrameAppMessageType.READY,
        });

        const unsubscribe = IFrameMessageBroker.onContentScriptMessage<DropdownIframeMessage>((message) => {
            logger.debug(`[IFrame::dropdown]: received "${message.type}"`);

            switch (message.type) {
                case IFrameAppMessageType.INIT: {
                    return setState((state) => merge(state, message.payload.workerState));
                }

                case IFrameAppMessageType.OPEN: {
                    const { height } = dropdownRef.current!.getBoundingClientRect();
                    return IFrameMessageBroker.postMessage({
                        sender: 'dropdown',
                        type: IFrameAppMessageType.DIMENSIONS,
                        payload: { height },
                    });
                }

                case DropdownMessageType.SET_ACTION: {
                    return handleAction(message.payload);
                }
                default:
                    break;
            }
        });

        return unsubscribe;
    }, []);

    const content = useMemo(() => {
        if (state !== undefined) {
            const { loggedIn, action } = state;

            if (!loggedIn) {
                return (
                    <DropdownItem
                        onClick={async () => {
                            IFrameMessageBroker.postMessage({
                                sender: 'dropdown',
                                type: IFrameAppMessageType.CLOSE,
                            });
                            await navigateToLogin();
                        }}
                        title={PASS_APP_NAME}
                        subTitle={c('Info').t`Login with your ${BRAND_NAME} account`}
                    />
                );
            }

            switch (action) {
                case DropdownAction.AUTOFILL:
                    return state.items.length > 0 ? (
                        <ItemsList items={state.items} />
                    ) : (
                        <DropdownItem
                            onClick={() =>
                                IFrameMessageBroker.postMessage({
                                    sender: 'dropdown',
                                    type: IFrameAppMessageType.CLOSE,
                                })
                            }
                            title={PASS_APP_NAME}
                            subTitle={c('Info').t`No login found`}
                            disabled
                        />
                    );

                case DropdownAction.AUTOSUGGEST_PASSWORD:
                    return <PasswordAutoSuggest />;

                case DropdownAction.AUTOSUGGEST_ALIAS:
                    return <AliasAutoSuggest options={state.aliasOptions} prefix={state.realm} />;
            }
        }

        return null;
    }, [state]);

    return (
        <ConfigProvider config={config}>
            <RightToLeftProvider>
                <Icons />
                <ThemeProvider />
                <div
                    ref={dropdownRef}
                    className="min-h-custom bg-norm"
                    style={{ '--min-height-custom': pixelEncoder(60) }}
                >
                    {content}
                </div>
            </RightToLeftProvider>
        </ConfigProvider>
    );
};

export default Dropdown;
