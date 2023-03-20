import { noop } from 'lodash';

import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType } from '@proton/pass/types';
import { first } from '@proton/pass/utils/array';
import { waitUntil } from '@proton/pass/utils/fp';
import { getScrollParent } from '@proton/shared/lib/helpers/dom';

import { ExtensionContext } from '../../../shared/extension';
import { DROPDOWN_IFRAME_SRC, DROPDOWN_WIDTH, MIN_DROPDOWN_HEIGHT } from '../../constants';
import CSContext from '../../context';
import { createIFrameApp } from '../../injections/iframe/create-iframe-app';
import { IFrameMessageBroker } from '../../injections/iframe/messages';
import {
    DropdownAction,
    DropdownIframeMessage,
    DropdownMessageType,
    DropdownSetActionPayload,
    DropdownState,
    FormType,
    InjectedDropdown,
    OpenDropdownOptions,
} from '../../types';
import { IFrameAppMessageType } from '../../types/iframe';

export const createDropdown = (): InjectedDropdown => {
    const state: DropdownState = { field: undefined };

    const app = createIFrameApp<DropdownIframeMessage>({
        id: 'dropdown',
        src: DROPDOWN_IFRAME_SRC,
        animation: 'fadein',
        backdropClose: true,
        backdropExclude: () => [state.field?.icon?.element, state.field?.element].filter(Boolean) as HTMLElement[],
        onReady: () => {
            app.sendMessage({
                type: IFrameAppMessageType.INIT,
                payload: { workerState: CSContext.get().state },
            });
        },
        getIframePosition: (iframeRoot) => {
            const field = state.field;

            if (!field) {
                return { top: 0, left: 0 };
            }

            const bodyTop = iframeRoot.getBoundingClientRect().top;

            /* TODO: should account for boxElement and offsets */
            const { left, top, width, height } = field.element.getBoundingClientRect();

            return {
                top: top - bodyTop + height,
                left: left + width - DROPDOWN_WIDTH,
                zIndex: field.getFormHandle().props.injections.zIndex,
            };
        },
        getIframeDimensions: () => ({ width: DROPDOWN_WIDTH, height: MIN_DROPDOWN_HEIGHT }),
    });

    const open = async ({ field, action, focus }: OpenDropdownOptions) => {
        /* ensure iframe is ready when opening on autofocused fields */
        await waitUntil(() => app.state.ready, 50);

        state.field = field;
        const icon = field.icon;

        icon?.setLoading(true);

        const payload = await (async (): Promise<DropdownSetActionPayload> => {
            const { formManager, state } = CSContext.get();
            switch (action) {
                case DropdownAction.AUTOFILL: {
                    const items = state.loggedIn ? await formManager.autofill.queryItems() : [];
                    return { action, items };
                }
                case DropdownAction.AUTOSUGGEST_ALIAS: {
                    const options = state.loggedIn ? await formManager.alias.getOptions() : null;
                    return { action, options, realm: ExtensionContext.get().realm! };
                }
                case DropdownAction.AUTOSUGGEST_PASSWORD: {
                    return { action };
                }
            }

            throw new Error('unsupported dropdown action');
        })();

        /**
         * If the opening action is coming from a focus event
         * for an autofill action and the we have no login
         * items that match the current domain, avoid auto-opening
         * the dropdown
         */
        if (!(focus && payload.action === DropdownAction.AUTOFILL && payload.items.length === 0)) {
            app.sendMessage({
                type: DropdownMessageType.SET_ACTION,
                payload,
            });

            const scrollParent = getScrollParent(field.element);
            app.open(scrollParent);
        }

        icon?.setLoading(false);
    };

    const dropdown: InjectedDropdown = {
        getState: () => app.state,
        sendMessage: app.sendMessage,
        reset: app.reset,
        close: app.close,
        open,
    };

    IFrameMessageBroker.onInjectedFrameMessage<DropdownIframeMessage>('dropdown', (message) => {
        const form = state.field?.getFormHandle();

        switch (message.type) {
            case DropdownMessageType.AUTOFILL: {
                if (form !== undefined && form.formType === FormType.LOGIN) {
                    const { username, password } = message.payload;
                    first(form.fields.username)?.autofill(username);
                    form.fields.password.forEach((field) => {
                        field.autofill(password);
                    });
                }
                return app.close();
            }
            case DropdownMessageType.AUTOFILL_PASSWORD: {
                if (form !== undefined && form.formType === FormType.REGISTER) {
                    const { password } = message.payload;
                    form.fields.password.forEach((field) => field.autofill(password));
                }
                return app.close();
            }
            case DropdownMessageType.AUTOFILL_ALIAS: {
                if (form !== undefined && form.formType === FormType.REGISTER) {
                    const { alias } = message.payload;
                    state.field?.icon?.setLoading(true);
                    app.close();

                    sendMessage
                        .onSuccess(
                            contentScriptMessage({
                                type: WorkerMessageType.ALIAS_CREATE,
                                payload: { alias },
                            }),
                            () => state.field?.autofill(alias.aliasEmail)
                        )
                        .catch(noop)
                        .finally(() => state.field?.icon?.setLoading(false));
                }
            }
        }
    });

    return dropdown;
};
