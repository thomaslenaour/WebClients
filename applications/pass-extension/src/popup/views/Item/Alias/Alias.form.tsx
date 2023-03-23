import { c } from 'ttag';

import { InputFieldTwo, Option } from '@proton/components';
import { normalize } from '@proton/shared/lib/helpers/string';

import AliasPreview from '../../../../shared/components/alias/Alias.preview';
import { useAliasOptions } from '../../../../shared/hooks';
import { FieldsetCluster } from '../../../components/Controls/FieldsetCluster';
import { Field } from '../../../components/Fields/Field';
import { SelectFieldWIP } from '../../../components/Fields/SelectField';
import { AliasFormProps, AliasFormValues } from './Alias.validation';

/*  Ensures we do not allow spaces of any kind in prefix */
const normalizePrefix = (input: string) => normalize(input.replace(/\s+/g, ''));

const AliasForm = <V extends AliasFormValues = AliasFormValues>({
    form,
    shareId,
    onAliasOptionsLoaded,
}: AliasFormProps<V>) => {
    const { aliasOptions, aliasOptionsLoading } = useAliasOptions({ shareId, onAliasOptionsLoaded });

    const displayedPrefix = form.values.aliasPrefix || '<prefix>';
    const disabled = aliasOptionsLoading || aliasOptions === null;

    return (
        <>
            <label className="field-two-label mb0-5 block">{c('Label').t`Alias address`}</label>

            <InputFieldTwo
                error={form.touched.aliasPrefix && form.errors.aliasPrefix}
                value={form.values.aliasPrefix}
                name="aliasPrefix"
                onValue={(prefix: string) => form.setFieldValue('aliasPrefix', normalizePrefix(prefix))}
                onBlur={() => form.setFieldTouched('aliasPrefix', true, true)}
                className="block mb0-75"
                dense
            />

            <FieldsetCluster>
                <Field
                    component={SelectFieldWIP}
                    disabled={disabled}
                    label={c('Label').t`Alias address`}
                    name="aliasSuffix"
                >
                    {(aliasOptions?.suffixes ?? []).map((suffix) => (
                        <Option key={suffix.value} value={suffix} title={suffix.value}>
                            {suffix.value}
                        </Option>
                    ))}
                </Field>
            </FieldsetCluster>

            <AliasPreview loading={disabled} prefix={displayedPrefix} suffix={form.values.aliasSuffix?.value ?? ''} />

            {
                <FieldsetCluster>
                    <Field
                        name="mailboxes"
                        label={c('Label').t`Forwarded to`}
                        placeholder={c('Label').t`Select an email address`}
                        component={SelectFieldWIP}
                        icon="arrow-up-and-right-big"
                        disabled={disabled}
                        multiple
                    >
                        {(aliasOptions?.mailboxes ?? []).map((mailbox) => (
                            <Option value={mailbox} title={mailbox.email} key={mailbox.id}>
                                {mailbox.email}
                            </Option>
                        ))}
                    </Field>
                </FieldsetCluster>
            }
        </>
    );
};

export default AliasForm;
