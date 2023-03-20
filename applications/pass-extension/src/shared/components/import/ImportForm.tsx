import React from 'react';

import { Field } from 'formik';
import { c } from 'ttag';

import { AttachedFile, Bordered, Dropzone, FileInput, Option, SelectTwo } from '@proton/components/components';
import { ImportProvider } from '@proton/pass/import';
import clsx from '@proton/utils/clsx';

import { ImportFormContext, SUPPORTED_IMPORT_FILE_TYPES } from '../../hooks/useImportForm';
import { PasswordField } from '../fields';

export const ImportForm: React.FC<Omit<ImportFormContext, 'reset'>> = ({ form, dropzone, busy }) => {
    return (
        <>
            <label className="field-two-label mb0-5 block">{c('Label').t`Provider`}</label>

            <SelectTwo
                value={form.values.provider}
                name="provider"
                onValue={(provider) => form.setFieldValue('provider', provider)}
                className="mb0-5"
                disabled={busy}
            >
                {Object.values(ImportProvider).map((provider) => (
                    <Option key={provider} value={provider} title={provider}>
                        {provider}
                    </Option>
                ))}
            </SelectTwo>

            <label className="mt2 field-two-label mb0-5 block">{c('Label').t`File`}</label>

            <Bordered
                className={clsx([
                    'relative border-dashed mb0-75',
                    dropzone.hovered && !busy && 'border-primary',
                    form.errors.file && 'border-danger',
                ])}
            >
                <Dropzone
                    isHovered={dropzone.hovered}
                    onDragEnter={dropzone.onDragEnter}
                    onDragLeave={dropzone.onDragLeave}
                    onDrop={dropzone.onDrop}
                    isDisabled={busy}
                >
                    {form.values.file ? (
                        <AttachedFile
                            file={form.values.file}
                            className={clsx(['border-none', busy && 'no-pointer-events'])}
                            iconName="file-lines"
                            clear={c('Action').t`Delete`}
                            onClear={() => form.setFieldValue('file', undefined)}
                        />
                    ) : (
                        <FileInput
                            accept={SUPPORTED_IMPORT_FILE_TYPES.map((ext) => `.${ext}`).join(',')}
                            onChange={dropzone.onAttach}
                            disabled={busy}
                        >
                            {c('Action').t`Choose a file or drag it here`}
                        </FileInput>
                    )}
                </Dropzone>
            </Bordered>

            <Field
                name="passphrase"
                label={c('Label').t`Passphrase`}
                component={PasswordField}
                allowGenerate={false}
                disabled={form.values.provider !== ImportProvider.PROTONPASS_PGP}
            />
        </>
    );
};
