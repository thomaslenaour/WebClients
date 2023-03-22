import type { VFC } from 'react';

import { type Props as TextFieldProps, TextFieldWIP } from './TextField';

import "./TitleField.scss";

const OVERRIDEN_PROPS = {
    inputClassName: 'pass-title-field text-bold color-norm p-0',
} as const;

type TitleFieldProps = TextFieldProps;

export const TitleField: VFC<TitleFieldProps> = ({ field, form, ...rest }) => {
    return <TextFieldWIP form={form} field={field} {...OVERRIDEN_PROPS} {...rest} />;
};
