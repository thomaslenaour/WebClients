import type { ReactNode } from 'react';

import type { FieldProps } from 'formik';

import { Props as TextInputControlProps } from '../Controls/TextInputControl';
import { Props as TextareaControlProps } from '../Controls/TextareaControl';

type ControlProps = TextInputControlProps | TextareaControlProps;

export type AbstractFieldProps<T extends ControlProps> = FieldProps & T;

export const AbstractField = <T extends ControlProps>({
    field,
    form,
    meta,
    children,
    ...rest
}: AbstractFieldProps<T> & { children: (props: T) => ReactNode }) => {
    const { name } = field;
    const { touched, errors } = form;
    const error = touched[name] && errors[name];
    const status = error ? 'error' : 'default';
    const inputControlProps = { ...rest, ...field, status, error } as unknown as T;

    return <>{children(inputControlProps)}</>;
};
