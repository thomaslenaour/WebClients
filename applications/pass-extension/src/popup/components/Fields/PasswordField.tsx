import { type VFC, useCallback, useState } from 'react';

import { PasswordGeneratorButton } from '../../../shared/components/password-generator/PasswordGeneratorButton';
import { type Props as TextFieldProps, TextFieldWIP } from './TextField';

type PasswordFieldProps = TextFieldProps;

export const PasswordFieldWIP: VFC<PasswordFieldProps> = ({ disabled, form, field, ...rest }) => {
    const [type, setType] = useState<'text' | 'password'>('password');

    const handlePasswordGeneratorDone = useCallback(
        (password: string) => {
            form.setFieldValue(field.name, password);
        },
        [form, field.name]
    );

    const actions = <PasswordGeneratorButton key="password-generator-button" onDone={handlePasswordGeneratorDone} />;

    return (
        <TextFieldWIP
            onFocus={() => setType('text')}
            onBlur={() => setType('password')}
            disabled={disabled}
            form={form}
            field={field}
            {...rest}
            type={type}
            actions={actions}
        />
    );
};
