import { c } from 'ttag';

import { Option } from '@proton/components';

import AliasPreview from '../../../../shared/components/alias/Alias.preview';
import { useAliasOptions } from '../../../../shared/hooks';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { Field } from '../../../components/Fields/Field';
import { SelectFieldWIP } from '../../../components/Fields/SelectField';
import { TextFieldWIP } from '../../../components/Fields/TextField';
import { AliasFormProps, AliasFormValues } from './Alias.validation';

export const AliasForm = <V extends AliasFormValues = AliasFormValues>({
    form,
    shareId,
    onAliasOptionsLoaded,
}: AliasFormProps<V>) => {
    const { aliasOptions, aliasOptionsLoading } = useAliasOptions({ shareId, onAliasOptionsLoaded });

    const displayedPrefix = form.values.aliasPrefix || '<prefix>';
    const disabled = aliasOptionsLoading || aliasOptions === null;

    return (
        <>
            <AliasPreview loading={disabled} prefix={displayedPrefix} suffix={form.values.aliasSuffix?.value ?? ''} />

            <FieldsetCluster>
                <Field name="aliasPrefix" label={c('Label').t`Prefix`} component={TextFieldWIP} />
                <Field name="aliasSuffix" label={c('Label').t`Suffix`} component={SelectFieldWIP} disabled={disabled}>
                    {(aliasOptions?.suffixes ?? []).map((suffix) => (
                        <Option key={suffix.value} value={suffix} title={suffix.value}>
                            {suffix.value}
                        </Option>
                    ))}
                </Field>
            </FieldsetCluster>

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
        </>
    );
};
