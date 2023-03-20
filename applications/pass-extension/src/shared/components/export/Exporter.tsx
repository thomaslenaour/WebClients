import React, { useState } from 'react';

import { Field, Form, FormikProvider, useFormik } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Card } from '@proton/atoms/Card';
import { Checkbox, useNotifications } from '@proton/components';
import { pageMessage, sendMessage } from '@proton/pass/extension/message';
import { WorkerMessageType } from '@proton/pass/types';
import { isEmptyString } from '@proton/pass/utils/string';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';
import downloadFile from '@proton/shared/lib/helpers/downloadFile';
import { wait } from '@proton/shared/lib/helpers/promise';

import { PasswordField } from '../fields';
import { createExportFile } from './createExportFile';

type ExportFormValues = { passphrase: string; encrypted: boolean };

export const Exporter: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { createNotification } = useNotifications();

    const form = useFormik<ExportFormValues>({
        initialValues: { passphrase: '', encrypted: true },
        validateOnChange: true,
        validateOnMount: true,
        validate: ({ encrypted, passphrase }) =>
            encrypted && isEmptyString(passphrase) ? { passphrase: c('Warning').t`Passphrase is required` } : {},
        onSubmit: async ({ encrypted, passphrase }) => {
            try {
                setLoading(true);

                await sendMessage.on(
                    pageMessage({
                        type: WorkerMessageType.EXPORT_REQUEST,
                        payload: encrypted ? { encrypted, passphrase } : { encrypted: false },
                    }),
                    async (res) => {
                        await wait(500);

                        if (res.type === 'success') {
                            const { filename, blob } = createExportFile(encrypted, res.data);
                            downloadFile(blob, filename);

                            createNotification({
                                type: 'success',
                                text: c('Info').t`Successfully exported all your items`,
                            });
                        } else {
                            throw new Error(res.error);
                        }
                    }
                );
            } catch (e) {
                console.warn(e);
                createNotification({ type: 'error', text: c('Warning').t`An error occured while exporting your data` });
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <FormikProvider value={form}>
            <Form className="modal-two-dialog-container">
                <Card background={false} rounded className="mb1">
                    <Checkbox
                        checked={form.values.encrypted}
                        onChange={(e) => form.setFieldValue('encrypted', e.target.checked)}
                        className="mb0"
                    >
                        <span className="ml0-75">
                            {c('Label').t`Encrypt your ${PASS_APP_NAME} data export file`}
                            <span className="block text-xs">{c('Info')
                                .t`Enables PGP encryption for the export file. Disable this option at your own risk : the output will be unprotected.`}</span>
                        </span>
                    </Checkbox>
                </Card>

                <Field
                    name="passphrase"
                    label={c('Label').t`Passphrase`}
                    component={PasswordField}
                    disabled={!form.values.encrypted}
                />

                <Button type="submit" color="norm" loading={loading} disabled={loading} className="mt1">
                    {c('Action').t`Export`}
                </Button>
            </Form>
        </FormikProvider>
    );
};
