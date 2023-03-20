import { WithAutoSavePromptOptions } from './autosave';
import { Realm, TabId } from './runtime';

export type BaseFormSubmission = {
    realm: Realm;
    subdomain: string | null;
    url: string;
    type: 'login' | 'register';
    action?: string /* form action attribute */;
};

export type FormSubmissionData =
    | {
          partial: true;
          data: { username: string; password: undefined };
      }
    | {
          partial: false;
          data: { username: string; password: string };
      };

export type FormSubmissionPayload = BaseFormSubmission & FormSubmissionData;

export enum FormSubmissionStatus {
    STAGING,
    COMMITTED,
}
export type FormSubmission =
    | ({
          status: FormSubmissionStatus.STAGING;
      } & FormSubmissionPayload)
    | ({
          status: FormSubmissionStatus.COMMITTED;
      } & Extract<FormSubmissionPayload, { partial: false }>);

export type CommittedFormSubmission = FormSubmission & { status: FormSubmissionStatus.COMMITTED };
export type PromptedFormSubmission = WithAutoSavePromptOptions<CommittedFormSubmission, true>;

export type FormIdentifier = `${TabId}:${Realm}`;
