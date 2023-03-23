import type { VFC } from 'react';

import { InputTwo } from '@proton/components/index';

import { type AbstractFieldProps } from './AbstractField';
import { TextFieldWIP } from './TextField';

export const TitleField: VFC<AbstractFieldProps<typeof InputTwo>> = (props) => (
    <TextFieldWIP {...props} inputClassName="pass-title-field text-bold color-norm p-0" />
);
