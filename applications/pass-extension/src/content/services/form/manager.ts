import { contentScriptMessage, sendMessage } from '@proton/pass/extension/message';
import { fathom } from '@proton/pass/fathom';
import {
    CommittedFormSubmission,
    FormSubmissionStatus,
    PromptedFormSubmission,
    WithAutoSavePromptOptions,
    WorkerMessageType,
} from '@proton/pass/types';
import { isMainFrame } from '@proton/pass/utils/dom';
import { ListenerStore, createListenerStore } from '@proton/pass/utils/listener';
import { logger } from '@proton/pass/utils/logger';
import { parseUrl } from '@proton/pass/utils/url';
import debounce from '@proton/utils/debounce';
import noop from '@proton/utils/noop';

import { isSubmissionCommitted } from '../../../shared/form';
import CSContext from '../../context';
import { getMutationResults } from '../../detection/check';
import { runDetection } from '../../detection/runner';
import { FormHandles, NotificationAction } from '../../types';
import { createAliasService } from '../alias';
import { createAutofillService } from '../autofill';

const { isVisible } = fathom.utils;

export type FormManagerContext = {
    mainFrame: boolean;
    active: boolean;
    realm: string;
    trackedForms: FormHandles[];
    listeners: ListenerStore;
};

export type FormManager = ReturnType<typeof createFormManager>;

export const createFormManager = () => {
    const ctx = {
        mainFrame: isMainFrame(),
        active: false,
        realm: parseUrl(window.location.hostname).domain,
        trackedForms: [],
        listeners: createListenerStore(),
    } as FormManagerContext;

    const autofillService = createAutofillService();
    const aliasService = createAliasService();

    /**
     * Reconciliation is responsible for syncing the service
     * worker state with our local detection in order to take
     * the appropriate action for auto-save.
     */
    const reconciliate = async () => {
        await autofillService.queryItems();

        const onCommittedSubmission = (submission: WithAutoSavePromptOptions<CommittedFormSubmission>) => {
            return (
                submission.autosave.shouldPrompt &&
                CSContext.get().iframes.notification?.open({
                    action: NotificationAction.AUTOSAVE_PROMPT,
                    submission: submission as PromptedFormSubmission,
                })
            );
        };

        const submission = await sendMessage.map(
            contentScriptMessage({ type: WorkerMessageType.REQUEST_FORM_SUBMISSION }),
            (response) => (response.type === 'success' ? response.submission : undefined)
        );

        if (submission !== undefined) {
            const { status, partial, realm, type } = submission;

            if (status === FormSubmissionStatus.STAGING && !partial) {
                const shouldCommit = ctx.realm === realm && !ctx.trackedForms.some(({ formType }) => formType === type);
                if (shouldCommit) {
                    await sendMessage.onSuccess(
                        contentScriptMessage({
                            type: WorkerMessageType.COMMIT_FORM_SUBMISSION,
                            reason: 'INFERRED_FORM_REMOVAL',
                        }),
                        ({ committed }) => committed !== undefined && onCommittedSubmission(committed)
                    );
                }
            }

            if (isSubmissionCommitted(submission)) {
                onCommittedSubmission(submission);
            }
        }
    };

    const detachTrackedForm = (target: FormHandles) => {
        target.detach();
        ctx.trackedForms = ctx.trackedForms.filter((form) => target !== form);
    };

    /**
     * Garbage collection is used to free resources
     * and clear listeners on any removed tracked form
     * before running any new detection on the current document.
     */
    const garbagecollect = () =>
        ctx.trackedForms.forEach((form) => {
            if (form.shouldRemove() || !isVisible(form.element)) {
                detachTrackedForm(form);
            }
        });

    const trackForms = (forms: FormHandles[]): void => {
        forms.forEach((detectedForm) => {
            const trackedForm = ctx.trackedForms.find((trackedForm) => detectedForm.element === trackedForm.element);

            if (!trackedForm) {
                detectedForm.attach();
                ctx.trackedForms = [...ctx.trackedForms, detectedForm];
            }
        });

        reconciliate().catch(noop);
    };

    const detect = (reason: string) => {
        logger.info(`[FormTracker]: Running detection for "${reason}" on ${ctx.mainFrame ? 'main_frame' : 'iframe'}`);
        garbagecollect();
        trackForms(runDetection(document));
    };

    const onMutation = debounce(() => {
        const results = getMutationResults(ctx.trackedForms);
        results.removeForms.forEach(detachTrackedForm);
        return results.runDetection && detect('MutationObserver');
    }, 250);

    const observe = () => {
        if (!ctx.active) {
            ctx.active = true;
            ctx.listeners.addObserver(onMutation, document.body, { childList: true, subtree: true });
            ctx.trackedForms.forEach((form) => form.attach());
        }
    };

    const sleep = () => {
        ctx.listeners.removeAll();
        ctx.trackedForms.forEach(detachTrackedForm);
        ctx.active = false;
    };

    return {
        autofill: autofillService,
        alias: aliasService,
        reconciliate,
        getForms: () => ctx.trackedForms,
        observe,
        detect,
        sleep,
    };
};
