import { c } from 'ttag';

import { InputFieldTwo, Option, SelectTwo } from '@proton/components';
import { normalize } from '@proton/shared/lib/helpers/string';

import AliasPreview from '../../../../shared/components/alias/Alias.preview';
import { useAliasOptions } from '../../../../shared/hooks';
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

            <SelectTwo
                disabled={disabled}
                value={form.values.aliasSuffix}
                name="aliasSuffix"
                onValue={(suffix) => form.setFieldValue('aliasSuffix', suffix)}
                className="mb0-5"
                error={form.touched.aliasSuffix && form.errors.aliasSuffix}
                {...(disabled
                    ? { renderSelected: () => <div className="extension-skeleton extension-skeleton--select" /> }
                    : {})}
            >
                {(aliasOptions?.suffixes ?? []).map((suffix) => (
                    <Option key={suffix.value} value={suffix} title={suffix.value}>
                        {suffix.value}
                    </Option>
                ))}
            </SelectTwo>

            <AliasPreview loading={disabled} prefix={displayedPrefix} suffix={form.values.aliasSuffix?.value ?? ''} />

            <InputFieldTwo
                disabled={disabled}
                label={c('Label').t`Mailboxes`}
                as={SelectTwo}
                name="mailboxes"
                value={form.values.mailboxes}
                onValue={(mailboxes: any) => form.setFieldValue('mailboxes', mailboxes)}
                multiple
                dense
                error={form.touched.mailboxes && form.errors.mailboxes}
                {...(disabled
                    ? { renderSelected: () => <div className="extension-skeleton extension-skeleton--select" /> }
                    : {})}
            >
                {(aliasOptions?.mailboxes ?? []).map((mailbox) => (
                    <Option value={mailbox} title={mailbox.email} key={mailbox.id}>
                        {mailbox.email}
                    </Option>
                ))}
            </InputFieldTwo>
        </>
    );
};

export default AliasForm;
