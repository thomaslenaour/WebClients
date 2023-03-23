import type { VFC } from 'react';

import { SelectTwo } from '@proton/components/index';

import { InputControl, type InputControlProps } from './InputControl';

export type Props = InputControlProps<typeof SelectTwo>;

export const SelectControl: VFC<Props> = (props) => {
    return (
        <InputControl<typeof SelectTwo>
            as={SelectTwo}
            rootClassName="static"
            caretIconName="chevron-down"
            labelContainerClassName="increase-click-surface color-weak text-normal"
            unstyled
            {...props}
        />
    );
};
