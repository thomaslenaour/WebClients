import { type FC, type MutableRefObject, useRef } from 'react';

import { type FieldProps } from 'formik';

import { InputFieldTwo, SelectTwo } from '@proton/components';
import { type InputFieldProps } from '@proton/components/components/v2/field/InputField';
import clsx from '@proton/utils/clsx';

import { useFieldControl } from '../../../hooks/useFieldControl';
import { FieldBox, type FieldBoxProps } from './Layout/FieldBox';

export type SelectFieldProps = FieldProps &
    InputFieldProps<typeof SelectTwo> &
    Omit<FieldBoxProps, 'actions' | 'actionsContainerClassName'>;

export const SelectField: FC<SelectFieldProps> = ({
    className,
    field,
    form,
    meta,
    children,
    icon,
    loading,
    onValue,
    ...props
}) => {
    const { error } = useFieldControl({ field, form, meta });
    const fieldBoxRef = useRef<HTMLDivElement>(null);

    return (
        <FieldBox className={clsx('items-center', className)} icon={icon} ref={fieldBoxRef}>
            <InputFieldTwo<typeof SelectTwo>
                as={SelectTwo}
                assistContainerClassName="empty:hidden"
                caretIconName="chevron-down"
                error={error}
                labelContainerClassName="expand-click-area color-weak m-0 text-normal text-sm"
                originalPlacement="bottom"
                renderSelected={loading ? () => <div className="pass-skeleton pass-skeleton--select" /> : undefined}
                anchorRef={fieldBoxRef as MutableRefObject<any>}
                unstyled
                {...field}
                {...props}
                onChange={undefined}
                onValue={(value: unknown) => {
                    onValue?.(value);
                    return form.setFieldValue(field.name, value);
                }}
            >
                {children}
            </InputFieldTwo>
        </FieldBox>
    );
};
