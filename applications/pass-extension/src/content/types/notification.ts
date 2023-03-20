import { Item, PromptedFormSubmission } from '@proton/pass/types';

import { IFrameService } from './iframe';

export enum NotificationMessageType {
    SET_ACTION = 'NOTIFICATION_SET_ACTION',
    AUTOSAVE_REQUEST = 'NOTIFICATION_AUTOSAVE_REQUEST',
    AUTOSAVE_SUCCESS = 'NOTIFICATION_AUTOSAVE_SUCCESS',
    AUTOSAVE_FAILURE = 'NOTIFICATION_AUTOSAVE_FAILURE',
}

export enum NotificationAction {
    AUTOSAVE_PROMPT,
}

export type NotificationIframeMessage =
    | {
          type: NotificationMessageType.AUTOSAVE_REQUEST;
          payload: {
              item: Item<'login'>;
              submission: PromptedFormSubmission;
          };
      }
    | {
          type: NotificationMessageType.SET_ACTION;
          payload: {
              action: NotificationAction.AUTOSAVE_PROMPT;
              submission: PromptedFormSubmission;
          };
      }
    | { type: NotificationMessageType.AUTOSAVE_SUCCESS }
    | { type: NotificationMessageType.AUTOSAVE_FAILURE; error: string }
    | { type: undefined };

export type OpenNotificationOptions = {
    action: NotificationAction;
    submission: PromptedFormSubmission;
};

export interface InjectedNotification extends IFrameService<NotificationIframeMessage, OpenNotificationOptions> {}
