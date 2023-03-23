import { type VFC, useCallback, useState } from 'react';

import type { Props as TextInputControlProps } from '../Controls/TextInputControl';
import { PasswordGeneratorButton } from '../PasswordGenerator/PasswordGeneratorButton';
import { type AbstractFieldProps } from './AbstractField';
import { TextFieldWIP } from './TextField';

export const PasswordFieldWIP: VFC<AbstractFieldProps<TextInputControlProps>> = ({ form, field, ...rest }) => {
    const [type, setType] = useState<'text' | 'password'>('password');

    const handlePasswordGeneratorDone = useCallback(
        (password: string) => form.setFieldValue(field.name, password),
        [form, field.name]
    );

    const actions = <PasswordGeneratorButton key="password-generator-button" onSubmit={handlePasswordGeneratorDone} />;

    return (
        <TextFieldWIP
            onFocus={() => setType('text')}
            onBlur={() => setType('password')}
            form={form}
            field={field}
            {...rest}
            type={type}
            actions={actions}
        />
    );
};
