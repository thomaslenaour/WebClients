import { type VFC } from 'react';

import { InputFieldTwo, TextAreaTwo } from '@proton/components';

import { type InputControlProps } from '../../Controls/InputControl';
import { BaseInputGroup } from '../../Controls/InputGroup';
import { AbstractField, type AbstractFieldProps } from '../AbstractField';

type TitleInputProps = InputControlProps<typeof InputFieldTwo>;

export const NoteTitleField: VFC<AbstractFieldProps<TitleInputProps>> = (props) => {
    return (
        <AbstractField<TitleInputProps> {...props}>
            {(inputProps) => (
                <BaseInputGroup>
                    <InputFieldTwo
                        dense
                        unstyled
                        assistContainerClassName="hidden-empty"
                        inputClassName="pass-title-field px-0 text-bold"
                        {...inputProps}
                    />
                </BaseInputGroup>
            )}
        </AbstractField>
    );
};

type TextAreaProps = InputControlProps<typeof TextAreaTwo>;

export const NoteTextAreaField: VFC<AbstractFieldProps<TextAreaProps>> = (props) => {
    return (
        <AbstractField<TextAreaProps> {...props}>
            {(textAreaProps) => (
                <BaseInputGroup>
                    <TextAreaTwo
                        autoGrow
                        unstyled
                        className="resize-none"
                        name="note"
                        minRows={2}
                        rows={10}
                        {...textAreaProps}
                    />
                </BaseInputGroup>
            )}
        </AbstractField>
    );
};
