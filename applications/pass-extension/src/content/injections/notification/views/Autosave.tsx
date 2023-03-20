import React, { useEffect, useState } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { FieldProps } from 'formik/dist/Field';
import { c } from 'ttag';
import uniqid from 'uniqid';

import { Button } from '@proton/atoms/Button';
import { Icon, InputFieldTwo, PasswordInputTwo } from '@proton/components/components';
import { useNotifications } from '@proton/components/hooks';
import { AutoSaveType, PromptedFormSubmission } from '@proton/pass/types';
import { isValidURL } from '@proton/pass/utils/url';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { IFrameAppMessageType, NotificationIframeMessage, NotificationMessageType } from '../../../types';
import { IFrameMessageBroker } from '../../iframe/messages';

import './Autosave.scss';

type AutosaveFormValues = {
    title: string;
    username: string;
    password: string;
};

export const Autosave: React.FC<{ submission: PromptedFormSubmission; onAutoSaved: () => void }> = ({
    submission,
    onAutoSaved,
}) => {
    const { createNotification } = useNotifications();
    const [busy, setBusy] = useState(false);
    const submissionURL = submission.subdomain ?? submission.realm;

    const form = useFormik<AutosaveFormValues>({
        initialValues: {
            title:
                submission.autosave.data.action === AutoSaveType.UPDATE
                    ? submission.autosave.data.item.data.metadata.name
                    : submissionURL,
            username: submission.data.username,
            password: submission.data.password,
        },
        validateOnChange: true,

        onSubmit: ({ title, username, password }) => {
            const { valid, url } = isValidURL(submissionURL);
            const revision =
                submission.autosave.data.action === AutoSaveType.UPDATE
                    ? {
                          note: submission.autosave.data.item.data.metadata.note,
                          urls: Array.from(
                              new Set(submission.autosave.data.item.data.content.urls.concat(valid ? [url] : []))
                          ),
                      }
                    : {
                          note: c('Info').t`Autosaved on ${submissionURL}`,
                          urls: valid ? [url] : [],
                      };

            IFrameMessageBroker.postMessage<NotificationIframeMessage>({
                type: NotificationMessageType.AUTOSAVE_REQUEST,
                origin: 'notification',
                payload: {
                    submission: submission,
                    item: {
                        type: 'login',
                        metadata: {
                            name: title,
                            note: revision.note,
                            itemUuid: uniqid(),
                        },
                        content: {
                            username,
                            password,
                            urls: revision.urls,
                            totpUri: '',
                        },
                        extraFields: [],
                    },
                },
            });

            setBusy(true);
        },
    });

    useEffect(
        () =>
            IFrameMessageBroker.onContentScriptMessage<NotificationIframeMessage>((message) => {
                switch (message.type) {
                    case NotificationMessageType.AUTOSAVE_FAILURE: {
                        createNotification({
                            text: c('Warning').t`Unable to save`,
                            type: 'error',
                        });
                        return setBusy(false);
                    }

                    case NotificationMessageType.AUTOSAVE_SUCCESS: {
                        return onAutoSaved();
                    }
                    default:
                        break;
                }
            }),
        []
    );

    return (
        <FormikProvider value={form}>
            <Form className="flex flex-column h100">
                <div className="flex flex-nowrap flex-item-noshrink flex-align-items-start flex-justify-space-between">
                    <div className="mt0-25">
                        <h3 className="text-bold text-2xl">
                            {submission.autosave.data.action === AutoSaveType.NEW &&
                                c('Info').t`Add to ${PASS_APP_NAME}`}
                            {submission.autosave.data.action === AutoSaveType.UPDATE && c('Info').t`Update credentials`}
                        </h3>
                    </div>
                    <div className="modal-two-header-actions flex flex-item-noshrink flex-nowrap flex-align-items-stretch">
                        <Button
                            className="flex-item-noshrink"
                            shape="ghost"
                            icon
                            onClick={() =>
                                IFrameMessageBroker.postMessage({
                                    type: IFrameAppMessageType.CLOSE,
                                    origin: 'notification',
                                })
                            }
                        >
                            <Icon name="cross-big" />
                        </Button>
                    </div>
                </div>
                <div className="flex-item-fluid">
                    <div className="flex flex-align-items-center mt1-5 mb1">
                        <Icon name={'key'} className="mr0-5 item-icon" color="#6D4AFF" />
                        <Field name="title">
                            {({ field }: FieldProps<AutosaveFormValues['title'], AutosaveFormValues>) => (
                                <input
                                    className="item-name--input text-xl text-bold flex-item-fluid"
                                    spellCheck={false}
                                    autoComplete={'off'}
                                    {...field}
                                />
                            )}
                        </Field>
                    </div>

                    <Field name="username">
                        {({ field }: FieldProps<AutosaveFormValues['username'], AutosaveFormValues>) => (
                            <InputFieldTwo dense label="Username" className="mb0-75" {...field} />
                        )}
                    </Field>

                    <Field name="password">
                        {({ field }: FieldProps<AutosaveFormValues['password'], AutosaveFormValues>) => (
                            <InputFieldTwo dense as={PasswordInputTwo} label="Password" {...field} />
                        )}
                    </Field>
                </div>
                <div className="flex flex-justify-space-between">
                    <Button
                        onClick={() =>
                            IFrameMessageBroker.postMessage({
                                type: IFrameAppMessageType.CLOSE,
                                origin: 'notification',
                            })
                        }
                    >
                        {c('Action').t`Not now`}
                    </Button>
                    <Button color="norm" type="submit" loading={busy} disabled={busy}>
                        {submission.autosave.data.action === AutoSaveType.NEW && c('Action').t`Add`}
                        {submission.autosave.data.action === AutoSaveType.UPDATE && c('Action').t`Update`}
                    </Button>
                </div>
            </Form>
        </FormikProvider>
    );
};
