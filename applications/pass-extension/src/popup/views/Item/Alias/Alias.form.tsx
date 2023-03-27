import { useState } from 'react';

import type { FormikContextType } from 'formik';
import { c } from 'ttag';

import { Button } from '@proton/atoms';
import { Icon, Option } from '@proton/components';

import type { UseAliasOptionsResult } from '../../../../shared/hooks/useAliasOptions';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { Field } from '../../../components/Fields/Field';
import { SelectFieldWIP } from '../../../components/Fields/SelectField';
import { TextFieldWIP } from '../../../components/Fields/TextField';
import { AliasFormValues } from './Alias.validation';

type AliasFormProps<V extends AliasFormValues> = {
    form: FormikContextType<V>;
    aliasOptionsLoading: UseAliasOptionsResult['aliasOptionsLoading'];
    aliasOptions: UseAliasOptionsResult['aliasOptions'];
};

export const AliasForm = <V extends AliasFormValues = AliasFormValues>({
    aliasOptionsLoading,
    aliasOptions,
    form,
}: AliasFormProps<V>) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const disabled = aliasOptionsLoading || aliasOptions === null;

    const mailboxesSelect = (
        <FieldsetCluster>
            <Field
                name="mailboxes"
                label={c('Label').t`Forwarded to`}
                placeholder={c('Label').t`Select an email address`}
                component={SelectFieldWIP}
                icon="arrow-up-and-right-big"
                multiple
                disabled={disabled || aliasOptions.mailboxes.length <= 1}
                loading={aliasOptionsLoading}
            >
                {(aliasOptions?.mailboxes ?? []).map((mailbox) => (
                    <Option value={mailbox} title={mailbox.email} key={mailbox.id}>
                        {mailbox.email}
                    </Option>
                ))}
            </Field>
        </FieldsetCluster>
    );

    if (!showAdvanced) {
        return (
            <>
                <div className="flex flex-justify-end mb-2">
                    <Button shape="ghost" onClick={() => setShowAdvanced(true)}>
                        <span className="flex flex-align-items-center">
                            <Icon name="cog-wheel" className="mr0-5" />
                            {c('Action').t`Advanced options`}
                        </span>
                    </Button>
                </div>
                {mailboxesSelect}
            </>
        );
    }

    return (
        <>
            <FieldsetCluster>
                <Field
                    name="aliasPrefix"
                    label={c('Label').t`Prefix`}
                    placeholder={c('Placeholder').t`Enter a prefix`}
                    component={TextFieldWIP}
                    onFocus={() => {
                        form.setFieldTouched('aliasPrefix', true);
                    }}
                />
                <Field
                    name="aliasSuffix"
                    label={c('Label').t`Suffix`}
                    placeholder={c('Placeholder').t`Select a suffix`}
                    component={SelectFieldWIP}
                    disabled={disabled}
                    loading={aliasOptionsLoading}
                >
                    {(aliasOptions?.suffixes ?? []).map((suffix) => (
                        <Option key={suffix.value} value={suffix} title={suffix.value}>
                            {suffix.value}
                        </Option>
                    ))}
                </Field>
            </FieldsetCluster>
            {mailboxesSelect}
        </>
    );
};
