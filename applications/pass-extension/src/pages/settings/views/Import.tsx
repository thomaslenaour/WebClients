import { type FC, useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Form, FormikProvider } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { Card } from '@proton/atoms/Card';
import { ModalTwo, ModalTwoContent, ModalTwoFooter, ModalTwoHeader } from '@proton/components';
import type { ImportPayload } from '@proton/pass/import';
import { selectRequestInFlight } from '@proton/pass/store';
import { importItems } from '@proton/pass/store/actions/requests';
import type { MaybeNull } from '@proton/pass/types';
import { pipe, tap } from '@proton/pass/utils/fp';
import { PASS_APP_NAME } from '@proton/shared/lib/constants';

import { ImportForm, ImportVaultsPicker, type ImportVaultsPickerHandle } from '../../../shared/components/import';
import {
    type UseImportFormBeforeSubmit,
    type UseImportFormBeforeSubmitValue,
    useImportForm,
} from '../../../shared/hooks';

export const Import: FC = () => {
    const [importData, setImportData] = useState<MaybeNull<ImportPayload>>(null);
    const vaultPickerRef = useRef<ImportVaultsPickerHandle>(null);
    const beforeSubmitResolver = useRef<(value: UseImportFormBeforeSubmitValue) => void>();
    const reset = () => beforeSubmitResolver.current?.({ ok: false });

    const beforeSubmit = useCallback<UseImportFormBeforeSubmit>(
        async (payload) =>
            new Promise((resolve) => {
                setImportData(payload);
                beforeSubmitResolver.current = pipe(
                    resolve,
                    tap(() => {
                        beforeSubmitResolver.current = undefined;
                        setImportData(null);
                    })
                );
            }),
        []
    );

    const { form, dropzone, busy } = useImportForm({ beforeSubmit });

    const importing = useSelector(selectRequestInFlight(importItems())) || busy;

    return (
        <>
            <Card rounded className="mb1">{c('Info')
                .t`In order to migrate your data to ${PASS_APP_NAME} from another password manager, export your passwords from your current provider and import them using the form below. Once all your items have been imported, delete the previously exported file.`}</Card>

            <FormikProvider value={form}>
                <Form className="modal-two-dialog-container">
                    <ImportForm form={form} dropzone={dropzone} busy={importing} />
                    <Button type="submit" disabled={importing || !form.isValid} loading={importing} color="norm">
                        {importing ? c('Action').t`Importing` : c('Action').t`Import`}
                    </Button>
                </Form>
            </FormikProvider>

            {importData && (
                <ModalTwo onClose={reset} onReset={reset} open size={'medium'}>
                    <ModalTwoHeader title={c('Title').t`Import to vaults`} />
                    <ModalTwoContent>
                        <ImportVaultsPicker
                            ref={vaultPickerRef}
                            payload={importData}
                            onSubmit={(payload) =>
                                beforeSubmitResolver?.current?.(
                                    payload.length === 0 ? { ok: false } : { ok: true, payload }
                                )
                            }
                        />
                    </ModalTwoContent>
                    <ModalTwoFooter>
                        <Button type="reset" onClick={reset} color="danger">
                            {c('Action').t`Cancel`}
                        </Button>
                        <Button type="button" color="norm" onClick={() => vaultPickerRef.current?.submit()}>{c('Action')
                            .t`Proceed`}</Button>
                    </ModalTwoFooter>
                </ModalTwo>
            )}
        </>
    );
};
