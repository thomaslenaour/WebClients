import type { AnyAction } from 'redux';
import type { Tabs } from 'webextension-polyfill';

import type { ResumedSessionResult } from '@proton/pass/auth';
import type { AliasState } from '@proton/pass/store';
import type { Notification } from '@proton/pass/store/actions/with-notification';
import type { ExtensionForkResultPayload } from '@proton/shared/lib/authentication/sessionForking';

import { ShareEventType } from '../api';
import type { AliasCreationDTO, Item, SelectedItem } from '../data';
import type { Maybe } from '../utils';
import type { WithAutoSavePromptOptions } from './autosave';
import type { SafeLoginItem } from './data';
import type { FormSubmission, FormSubmissionPayload, PromptedFormSubmission } from './form';
import type { TabId } from './runtime';
import type { WorkerState } from './state';

export enum WorkerMessageType {
    /* AUTH */
    FORK = 'fork',
    RESUME_SESSION_SUCCESS = 'RESUME_SESSION_SUCCESS',
    /* WORKER */
    WORKER_WAKEUP = 'WORKER_WAKEUP',
    WORKER_INIT = 'WORKER_INIT',
    WORKER_STATUS = 'WORKER_STATUS',
    /* CONTENT-SCRIPT */
    UNLOAD_CONTENT_SCRIPT = 'UNLOAD_CONTENT_SCRIPT',
    /* TABS */
    RESOLVE_TAB = 'RESOLVE_TAB',
    /* PORTS */
    PORT_FORWARDING_MESSAGE = 'PORT_FORWARDING',
    PORT_UNAUTHORIZED = 'PORT_UNAUTHORIZED',
    /* REDUX */
    NOTIFICATION = 'NOTIFICATION',
    STORE_ACTION = 'STORE_ACTION',
    /* AUTOFILL */
    AUTOFILL_QUERY = 'AUTOFILL_QUERY',
    AUTOFILL_SELECT = 'AUTOFILL_SELECT',
    AUTOFILL_SYNC = 'AUTOFILL_SYNC',
    /* AUTOSAVE */
    AUTOSAVE_REQUEST = 'AUTOSAVE_REQUEST',
    /* ALIAS */
    ALIAS_OPTIONS = 'ALIAS_OPTIONS',
    ALIAS_CREATE = 'ALIAS_CREATE',
    /* FORM SUBMISSION */
    STAGE_FORM_SUBMISSION = 'STAGE_FORM_SUBMISSION',
    STASH_FORM_SUBMISSION = 'STASH_FORM_SUBMISSION',
    COMMIT_FORM_SUBMISSION = 'COMMIT_FORM_SUBMISSION',
    REQUEST_FORM_SUBMISSION = 'REQUEST_FORM_SUBMISSION',
    /* EXPORT/IMPORT */
    EXPORT_REQUEST = 'EXPORT_REQUEST',
    EXPORT_DECRYPT = 'EXPORT_DECRYPT',
    /* SERVER EVENT */
    SHARE_SERVER_EVENT = 'SHARE_SERVER_EVENT',
}

export type WorkerForkMessage = {
    type: WorkerMessageType.FORK;
    payload: {
        selector: string;
        keyPassword: string;
        persistent: boolean;
        trusted: boolean;
        state: string;
    };
};

export type WorkerWakeUpMessage = {
    type: WorkerMessageType.WORKER_WAKEUP;
    payload: { tabId: TabId };
};

export type WorkerInitMessage = {
    type: WorkerMessageType.WORKER_INIT;
    payload: { sync: boolean };
};

export type WorkerStatusMessage = {
    type: WorkerMessageType.WORKER_STATUS;
    payload: { state: WorkerState };
};

export type UnloadContentScriptMessage = { type: WorkerMessageType.UNLOAD_CONTENT_SCRIPT };

export type StoreActionMessage = {
    type: WorkerMessageType.STORE_ACTION;
    payload: { action: AnyAction };
};

export type NotificationMessage = {
    type: WorkerMessageType.NOTIFICATION;
    payload: { notification: Notification };
};

export type ResumeSessionSuccessMessage = {
    type: WorkerMessageType.RESUME_SESSION_SUCCESS;
    payload: ResumedSessionResult;
};

export type AutofillQueryMessage = { type: WorkerMessageType.AUTOFILL_QUERY };
export type AutofillSyncMessage = { type: WorkerMessageType.AUTOFILL_SYNC; payload: { count: number } };

export type AutofillSelectMessage = {
    type: WorkerMessageType.AUTOFILL_SELECT;
    payload: SelectedItem;
};

export type AutoSaveRequestMessage = {
    type: WorkerMessageType.AUTOSAVE_REQUEST;
    payload: { item: Item<'login'>; submission: PromptedFormSubmission };
};

export type StageFormSubmissionMessage = {
    type: WorkerMessageType.STAGE_FORM_SUBMISSION;
    reason: string;
    payload: Pick<FormSubmissionPayload, 'type' | 'action' | 'data'>;
};

export type StashFormSubmissionMessage = {
    type: WorkerMessageType.STASH_FORM_SUBMISSION;
    reason: string;
};

export type CommitFormSubmissionMessage = {
    type: WorkerMessageType.COMMIT_FORM_SUBMISSION;
    reason: string;
};

export type RequestFormSubmissionMessage = {
    type: WorkerMessageType.REQUEST_FORM_SUBMISSION;
};

export type AliasOptionsMessage = { type: WorkerMessageType.ALIAS_OPTIONS };
export type AliasCreateMessage = { type: WorkerMessageType.ALIAS_CREATE; payload: { alias: AliasCreationDTO } };

export type ResolveTabIdMessage = { type: WorkerMessageType.RESOLVE_TAB };

export type PortFrameForwardingMessage<T = any> = {
    type: WorkerMessageType.PORT_FORWARDING_MESSAGE;
    forwardTo: string;
    payload: T;
};

export type PortUnauthorizedMessage = { type: WorkerMessageType.PORT_UNAUTHORIZED };

export type ExportRequestMessage = {
    type: WorkerMessageType.EXPORT_REQUEST;
    payload: { encrypted: true; passphrase: string } | { encrypted: false };
};

export type ImportDecryptMessage = {
    type: WorkerMessageType.EXPORT_DECRYPT;
    payload: { data: string; passphrase: string };
};

export type ShareServerEventMessage = {
    type: WorkerMessageType.SHARE_SERVER_EVENT;
    payload:
        | { type: ShareEventType.SHARE_DISABLED; shareId: string }
        | { type: ShareEventType.ITEMS_DELETED; shareId: string; itemIds: string[] };
};

export type WorkerMessage =
    | StoreActionMessage
    | NotificationMessage
    | WorkerForkMessage
    | WorkerWakeUpMessage
    | WorkerInitMessage
    | WorkerStatusMessage
    | UnloadContentScriptMessage
    | ResumeSessionSuccessMessage
    | AutofillQueryMessage
    | AutofillSelectMessage
    | AutofillSyncMessage
    | AutoSaveRequestMessage
    | StageFormSubmissionMessage
    | StashFormSubmissionMessage
    | CommitFormSubmissionMessage
    | RequestFormSubmissionMessage
    | AliasOptionsMessage
    | AliasCreateMessage
    | ResolveTabIdMessage
    | ExportRequestMessage
    | ImportDecryptMessage
    | ShareServerEventMessage
    | PortFrameForwardingMessage
    | PortUnauthorizedMessage;

export type ExtensionEndpoint = 'popup' | 'content-script' | 'background' | 'page';

export type WorkerMessageWithSender<T extends WorkerMessage = WorkerMessage> = T & {
    sender: ExtensionEndpoint;
};

export type MessageFailure = { type: 'error'; error: string; payload?: string };
export type MessageSuccess<T> = T extends { [key: string]: any } ? T & { type: 'success' } : { type: 'success' };
export type MaybeMessage<T> = MessageSuccess<T> | MessageFailure;

export type WorkerMessageResponse<MessageType> = MessageType extends WorkerMessageType.WORKER_WAKEUP
    ? WorkerState & { buffered?: WorkerMessageWithSender[] }
    : MessageType extends WorkerMessageType.WORKER_INIT
    ? WorkerState
    : MessageType extends WorkerMessageType.RESOLVE_TAB
    ? { tab: Maybe<Tabs.Tab> }
    : MessageType extends WorkerMessageType.FORK
    ? { payload: ExtensionForkResultPayload }
    : MessageType extends WorkerMessageType.REQUEST_FORM_SUBMISSION
    ? { submission: Maybe<WithAutoSavePromptOptions<FormSubmission>> }
    : MessageType extends WorkerMessageType.COMMIT_FORM_SUBMISSION
    ? { committed: Maybe<PromptedFormSubmission> }
    : MessageType extends WorkerMessageType.STAGE_FORM_SUBMISSION
    ? { staged: FormSubmission }
    : MessageType extends WorkerMessageType.AUTOFILL_QUERY
    ? { items: SafeLoginItem[] }
    : MessageType extends WorkerMessageType.AUTOFILL_SELECT
    ? { username: string; password: string }
    : MessageType extends WorkerMessageType.ALIAS_OPTIONS
    ? { options: AliasState['aliasOptions'] }
    : MessageType extends WorkerMessageType.EXPORT_REQUEST | WorkerMessageType.EXPORT_DECRYPT
    ? { data: string }
    : boolean;

export type WorkerResponse<T extends Maybe<WorkerMessage | WorkerMessageWithSender>> = T extends undefined
    ? MessageFailure
    : T extends WorkerMessage
    ? T['type'] extends infer MessageType
        ? MaybeMessage<WorkerMessageResponse<MessageType>>
        : never
    : never;

export type WorkerSendResponse<T extends Maybe<WorkerMessage> = Maybe<WorkerMessage>> = (
    response: WorkerResponse<T>
) => void;
