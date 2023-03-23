import type { VFC } from 'react';

import { TextAreaTwo } from '@proton/components/index';

import { AbstractField, type AbstractFieldProps } from './AbstractField';

export const TextAreaFieldWIP: VFC<AbstractFieldProps<typeof TextAreaTwo>> = (props) => (
    <AbstractField as={TextAreaTwo} autoGrow minRows={2} rows={15} {...props} />
);
