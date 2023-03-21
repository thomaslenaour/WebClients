import { FC, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { c } from 'ttag';

import type { Maybe } from '@proton/pass/types';

import { SessionLockPinModal } from './SessionLockPinModal';

type PinConfirmModalState = { loading: boolean; opened: boolean; title: string; text: string };
type PinConfirmOptions = Partial<Pick<PinConfirmModalState, 'title' | 'text'>> & {
    onClose?: () => void;
    onSubmit: (pin: string) => any | Promise<any>;
};
type SessionLockConfirmContextValue = { confirmPin: (options: PinConfirmOptions) => Promise<void> };

const getInitialModalState = (): PinConfirmModalState => ({
    title: c('Title').t`Enter your Pin`,
    text: c('Info').t`Please enter your current pin code to continue`,
    loading: false,
    opened: false,
});

class ConfirmSessionLockPinAbortedError extends Error {}
const SessionLockConfirmContext = createContext<SessionLockConfirmContextValue>({ confirmPin: async () => {} });

export const SessionLockConfirmContextProvider: FC = ({ children }) => {
    const pinResolver = useRef<Maybe<(pin: string) => void>>();
    const pinRejector = useRef<Maybe<(err: Error) => void>>();
    const [{ opened, loading, title, text }, setModalState] = useState(getInitialModalState());

    const abort = useCallback(() => {
        pinRejector.current?.(new ConfirmSessionLockPinAbortedError());
        setModalState(getInitialModalState());
    }, []);

    const sessionLockContext = useMemo<SessionLockConfirmContextValue>(
        () => ({
            confirmPin: async (opts) => {
                const { onClose, onSubmit, ...modalOptions } = opts;
                setModalState((state) => ({ ...state, ...modalOptions, opened: true }));

                try {
                    const pin = await new Promise<string>((resolve, reject) => {
                        pinResolver.current = resolve;
                        pinRejector.current = reject;
                    });

                    setModalState((state) => ({ ...state, loading: true }));
                    await onSubmit(pin);
                } catch (e) {
                    setModalState((state) => ({ ...state, loading: false }));

                    if (e instanceof ConfirmSessionLockPinAbortedError) {
                        opts?.onClose?.();
                    } else {
                        await sessionLockContext.confirmPin(opts);
                    }
                } finally {
                    setModalState(getInitialModalState());
                }
            },
        }),
        []
    );

    return (
        <SessionLockConfirmContext.Provider value={sessionLockContext}>
            <SessionLockPinModal
                open={opened}
                loading={loading}
                title={title}
                assistiveText={text}
                onSubmit={(pin) => pinResolver.current?.(pin)}
                onClose={abort}
            />
            {children}
        </SessionLockConfirmContext.Provider>
    );
};

export const useSessionLockConfirmContext = () => useContext(SessionLockConfirmContext);
