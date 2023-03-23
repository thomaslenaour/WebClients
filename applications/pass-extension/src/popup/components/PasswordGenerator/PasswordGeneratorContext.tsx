/**
 * Similar to `SessionLockConfirmContextProvider`
 * FIXME: the overall pattern with a context exposing
 * modal controls with an async resolver could be
 * abstracted to reduce boilerplate code.
 */
import { type FC, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { Maybe } from '@proton/pass/types';

import { PasswordGeneratorModal, type BaseProps as PasswordGeneratorModalProps } from './PasswordGeneratorModal';

type ModalState = Omit<PasswordGeneratorModalProps, 'onSubmit'>;
type PasswordGeneratorModalState = ModalState & { opened: boolean };
type PasswordGeneratorOptions = ModalState & { onSubmit?: (password: string) => Promise<void> | void };
type PasswordGeneratorContextValue = { generatePassword: (options: PasswordGeneratorOptions) => Promise<void> };

const PasswordGeneratorContext = createContext<PasswordGeneratorContextValue>({ generatePassword: async () => {} });
const getInitialModalState = (): PasswordGeneratorModalState => ({ opened: false, actionLabel: '' });

export const PasswordGeneratorContextProvider: FC = ({ children }) => {
    const passwordResolver = useRef<Maybe<(password: string) => void>>();
    const passwordRejector = useRef<Maybe<() => void>>();

    const [{ opened, actionLabel, className }, setState] = useState<PasswordGeneratorModalState>(
        getInitialModalState()
    );

    const abort = useCallback(() => {
        passwordRejector.current?.();
        setState(getInitialModalState());
    }, []);

    const contextValue = useMemo<PasswordGeneratorContextValue>(
        () => ({
            generatePassword: async (opts) => {
                const { onSubmit, ...modalOptions } = opts;
                setState((state) => ({ ...state, ...modalOptions, opened: true }));

                try {
                    const password = await new Promise<string>((resolve, reject) => {
                        passwordResolver.current = resolve;
                        passwordRejector.current = reject;
                    });
                    await onSubmit?.(password);
                } catch (_) {
                } finally {
                    setState(getInitialModalState());
                }
            },
        }),
        []
    );

    return (
        <PasswordGeneratorContext.Provider value={contextValue}>
            {children}
            <PasswordGeneratorModal
                open={opened}
                onClose={abort}
                actionLabel={actionLabel}
                onSubmit={passwordResolver.current}
                className={className}
            />
        </PasswordGeneratorContext.Provider>
    );
};

export const usePasswordGeneratorContext = () => useContext(PasswordGeneratorContext);
