import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType } from '@proton/pass/types';
import { first } from '@proton/pass/utils/array';
import { waitUntil } from '@proton/pass/utils/fp';
import { getScrollParent } from '@proton/shared/lib/helpers/dom';

import { ExtensionContext } from '../../../shared/extension';
import { DROPDOWN_IFRAME_SRC, DROPDOWN_WIDTH, MIN_DROPDOWN_HEIGHT } from '../../constants';
import CSContext from '../../context';
import { createIFrameApp } from '../../injections/iframe/create-iframe-app';
import type { DropdownSetActionPayload, DropdownState, InjectedDropdown, OpenDropdownOptions } from '../../types';
import { DropdownAction, FormType } from '../../types';
import { IFrameMessageType } from '../../types/iframe';

export const createDropdown = (): InjectedDropdown => {
    const state: DropdownState = { field: undefined };

    const iframe = createIFrameApp({
        id: 'dropdown',
        src: DROPDOWN_IFRAME_SRC,
        animation: 'fadein',
        backdropClose: true,
        backdropExclude: () => [state.field?.icon?.element, state.field?.element].filter(Boolean) as HTMLElement[],
        getIframePosition: (iframeRoot) => {
            const field = state.field;

            if (!field) {
                return { top: 0, left: 0 };
            }

            const bodyTop = iframeRoot.getBoundingClientRect().top;
            /* FIXME: should account for boxElement and offsets */
            const { left, top, width, height } = field.element.getBoundingClientRect();

            return {
                top: top - bodyTop + height,
                left: left + width - DROPDOWN_WIDTH,
                zIndex: field.getFormHandle().props.injections.zIndex,
            };
        },
        getIframeDimensions: () => ({ width: DROPDOWN_WIDTH, height: MIN_DROPDOWN_HEIGHT }),
    });

    /* As we are recyling the dropdown iframe sub-app instead of
     * re-injecting for each field - opening the dropdown involves
     * passing the actual field handle to attach it to
     * Dropdown opening may be automatically triggered on initial
     * page load with a positive detection : ensure the iframe is
     * in a ready state in order to send out the dropdown action */
    const open = async ({ field, action, focus }: OpenDropdownOptions) => {
        await waitUntil(() => iframe.state.ready, 50);

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

        /* If the opening action is coming from a focus event
         * for an autofill action and the we have no login
         * items that match the current domain, avoid auto-opening
         * the dropdown */
        if (!(focus && payload.action === DropdownAction.AUTOFILL && payload.items.length === 0)) {
            iframe.sendPortMessage({ type: IFrameMessageType.DROPDOWN_ACTION, payload });
            const scrollParent = getScrollParent(field.element);
            iframe.open(scrollParent);
        }

        icon?.setLoading(false);
    };

    /* On a login autofill request - resolve the credentials via
     * worker communication and autofill the parent form of the
     * field the current dropdown is attached to.
     * FIXME: autofill logic should be moved to the AutofillService */
    iframe.registerMessageHandler(IFrameMessageType.DROPDOWN_AUTOFILL_LOGIN, (message) => {
        const { shareId, itemId } = message.payload.item;

        void sendMessage.onSuccess(
            contentScriptMessage({
                type: WorkerMessageType.AUTOFILL_SELECT,
                payload: { shareId, itemId },
            }),
            ({ username, password }) => {
                const form = state.field?.getFormHandle();
                if (form !== undefined && form.formType === FormType.LOGIN) {
                    first(form.fields.username)?.autofill(username);
                    form.fields.password.forEach((field) => field.autofill(password));
                }
                return iframe.close();
            }
        );
    });

    /* For a password auto-suggestion - the password will have
     * been generated in the injected iframe and passed in clear
     * text through the secure extension port channel.
     * FIXME: Handle forms other than REGISTER for autofilling */
    iframe.registerMessageHandler(IFrameMessageType.DROPDOWN_AUTOSUGGEST_PASSWORD, (message) => {
        const form = state.field?.getFormHandle();

        if (form !== undefined && form.formType === FormType.REGISTER) {
            const { password } = message.payload;
            form.fields.password.forEach((field) => field.autofill(password));
        }

        return iframe.close();
    });

    /* When suggesting an alias on a register form, the alias will
     * only be created upon user action - this avoids creating
     * aliases everytime the injected iframe dropdown is opened */
    iframe.registerMessageHandler(IFrameMessageType.DROPDOWN_AUTOSUGGEST_ALIAS, ({ payload }) => {
        const form = state.field?.getFormHandle();
        const { aliasEmail } = payload.alias;

        if (form !== undefined && form.formType === FormType.REGISTER) {
            state.field?.icon?.setLoading(true);
            iframe.close();

            void sendMessage.onSuccess(contentScriptMessage({ type: WorkerMessageType.ALIAS_CREATE, payload }), () => {
                state.field?.autofill(aliasEmail);
                state.field?.icon?.setLoading(false);
            });
        }
    });

    return {
        getState: () => iframe.state,
        reset: iframe.reset,
        close: iframe.close,
        init: iframe.init,
        destroy: iframe.destroy,
        open,
    };
};
