import { CommittedFormSubmission, FormSubmission, FormSubmissionStatus } from '@proton/pass/types';

export const isSubmissionCommitted = (submission: FormSubmission): submission is CommittedFormSubmission =>
    submission.status === FormSubmissionStatus.COMMITTED;

export const canCommitSubmission = (submission: FormSubmission): submission is CommittedFormSubmission =>
    submission.partial === false && isSubmissionCommitted(submission);
