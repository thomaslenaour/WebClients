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

    const actions =
        rest.actions !== null ? (
            <PasswordGeneratorButton key="password-generator-button" onSubmit={handlePasswordGeneratorDone} />
        ) : undefined;

    return (
        <TextFieldWIP
            onFocus={() => setType('text')}
            onBlur={(evt) => {
                setType('password');
                field.onBlur(evt);
            }}
            form={form}
            field={field}
            {...rest}
            type={type}
            actions={actions}
        />
    );
};
