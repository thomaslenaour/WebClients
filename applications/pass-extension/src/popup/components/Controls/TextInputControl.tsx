import type { VFC } from 'react';

import { InputTwo } from '@proton/components/index';

import { InputControl, type InputControlProps } from './InputControl';

export type Props = InputControlProps<typeof InputTwo> & { type?: 'text' | 'password' };

export const TextInputControl: VFC<Props> = (props) => (
    <InputControl<typeof InputTwo> unstyled inputClassName="color-norm p-0" {...props} />
);
