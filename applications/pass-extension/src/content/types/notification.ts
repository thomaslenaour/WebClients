import type { Item, PromptedFormSubmission } from '@proton/pass/types';

import type { IFrameService } from './iframe';

export enum NotificationAction {
    AUTOSAVE_PROMPT,
}

export type NotificationSetActionPayload = {
    action: NotificationAction.AUTOSAVE_PROMPT;
    submission: PromptedFormSubmission;
};

export type NotificationAutosaveRequestPayload = { item: Item<'login'>; submission: PromptedFormSubmission };

export type OpenNotificationOptions = {
    action: NotificationAction;
    submission: PromptedFormSubmission;
};

export interface InjectedNotification extends IFrameService<OpenNotificationOptions> {}
