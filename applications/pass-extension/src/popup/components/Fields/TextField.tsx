import type { VFC } from 'react';

import type { FieldProps } from 'formik';

import { InputControl, type Props as InputControlProps } from '../Controls/Input';

export type Props = FieldProps & InputControlProps;

export const TextFieldWIP: VFC<Props> = ({ field, form, ...rest }) => {
    const { name } = field;
    const { touched, errors } = form;
    const error = touched[name] && errors[name];
    const status = error ? 'error' : 'default';

    return <InputControl {...field} status={status} error={error} {...rest} />;
};
