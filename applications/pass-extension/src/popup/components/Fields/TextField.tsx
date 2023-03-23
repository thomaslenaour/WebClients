import type { VFC } from 'react';

import { InputTwo } from '@proton/components/index';

import { AbstractField, type AbstractFieldProps } from './AbstractField';

export const TextFieldWIP: VFC<AbstractFieldProps<typeof InputTwo>> = (props) => (
    <AbstractField
        unstyled
        labelContainerClassName="color-norm text-normal"
        inputClassName="color-norm p-0"
        {...props}
    />
);
