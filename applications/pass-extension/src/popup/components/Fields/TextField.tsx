import type { ElementType, VFC } from 'react';

import type { FieldProps } from 'formik';

import { InputFieldTwo } from '@proton/components';

import { InputControl, type Props as InputControlProps } from '../Controls/Input';

export type Props<T extends ElementType = typeof InputFieldTwo> = FieldProps & InputControlProps<T>;

export const TextFieldWIP: VFC<Props> = ({ field, form, ...rest }) => {
    const { name } = field;
    const { touched, errors } = form;
    const error = touched[name] && errors[name];
    const status = error ? 'error' : 'default';

    return <InputControl {...field} status={status} error={error} {...rest} />;
};
