import { type VFC } from 'react';

import { TextAreaTwo } from '@proton/components/index';

import { type Props as TextFieldProps, TextFieldWIP } from './TextField';

type Props = TextFieldProps<typeof TextAreaTwo>;

export const TextAreaFieldWIP: VFC<Props> = ({ disabled, form, field, ...rest }) => {
    return <TextFieldWIP form={form} field={field} as={TextAreaTwo} autoGrow minRows={2} rows={15} {...rest} />;
};
