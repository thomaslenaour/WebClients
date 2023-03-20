import { FC } from 'react';

import { FieldProps } from 'formik';

import { InputFieldTwo, PasswordInputTwo } from '@proton/components';
import { InputFieldOwnProps } from '@proton/components/components/v2/field/InputField';

import { PasswordGeneratorButton } from '../password-generator';

type PasswordFieldProps = FieldProps &
    InputFieldOwnProps & {
        allowGenerate?: boolean;
    };

const PasswordField: FC<PasswordFieldProps> = ({ field, form, allowGenerate = true, ...rest }) => {
    const { name } = field;
    const { touched, errors } = form;
    const error = touched[name] && errors[name];

    const handlePasswordGeneratorDone = (password: string) => {
        form.setFieldValue(field.name, password);
    };

    return (
        <div className="flex flex-nowrap flex-align-items-end mb0-75">
            <InputFieldTwo dense as={PasswordInputTwo} error={error} {...field} {...rest} />
            {allowGenerate && (
                <PasswordGeneratorButton
                    onDone={handlePasswordGeneratorDone}
                    className="ml0-5"
                    disabled={rest.disabled}
                />
            )}
        </div>
    );
};

export default PasswordField;
