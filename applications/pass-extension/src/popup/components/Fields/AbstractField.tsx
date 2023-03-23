import type { ElementType } from 'react';

import type { FieldProps } from 'formik';

import { InputControl, type InputControlProps } from '../Controls/Input';

export type AbstractFieldProps<T extends ElementType> = FieldProps & InputControlProps<T>;

export const AbstractField = <T extends ElementType>({ field, form, meta, ...rest }: AbstractFieldProps<T>) => {
    const { name } = field;
    const { touched, errors } = form;
    const error = touched[name] && errors[name];
    const status = error ? 'error' : 'default';
    const inputControlProps = { ...rest, ...field, status, error } as InputControlProps<T>;

    return <InputControl<T> {...inputControlProps} assistContainerClassName="hidden-empty" />;
};
