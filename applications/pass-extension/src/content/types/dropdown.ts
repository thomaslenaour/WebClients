import { AliasState } from '@proton/pass/store';
import { AliasCreationDTO, Maybe, Realm, SafeLoginItem } from '@proton/pass/types';

import { FieldHandles, FormField, FormType } from './form';
import { IFrameService } from './iframe';

export enum DropdownMessageType {
    SET_ACTION = 'DROPDOWN_SET_ACTION',
    AUTOFILL = 'DROPDOWN_AUTOFILL',
    AUTOFILL_PASSWORD = 'DROPDOWN_AUTOFILL_PASSWORD',
    AUTOFILL_ALIAS = 'DROPDOWN_AUTOFILL_ALIAS',
}

export enum DropdownAction {
    AUTOFILL,
    AUTOSUGGEST_PASSWORD,
    AUTOSUGGEST_ALIAS,
    AUTOSAVE,
}

export type DropdownSetActionPayload =
    | { action: DropdownAction.AUTOFILL; items: SafeLoginItem[] }
    | { action: DropdownAction.AUTOSUGGEST_PASSWORD }
    | { action: DropdownAction.AUTOSUGGEST_ALIAS; options: AliasState['aliasOptions']; realm: Realm };

export type DropdownIframeMessage =
    | {
          type: DropdownMessageType.AUTOFILL;
          payload: { username: string; password: string };
      }
    | {
          type: DropdownMessageType.AUTOFILL_PASSWORD;
          payload: { password: string };
      }
    | {
          type: DropdownMessageType.AUTOFILL_ALIAS;
          payload: { alias: AliasCreationDTO };
      }
    | {
          type: DropdownMessageType.SET_ACTION;
          payload: DropdownSetActionPayload;
      }
    | { type: undefined };

export type DropdownState = {
    field: Maybe<FieldHandles<FormType, FormField>>;
};

export type OpenDropdownOptions = {
    field: FieldHandles;
    action: DropdownAction;
    focus?: boolean;
};

export interface InjectedDropdown extends IFrameService<DropdownIframeMessage, OpenDropdownOptions> {}
