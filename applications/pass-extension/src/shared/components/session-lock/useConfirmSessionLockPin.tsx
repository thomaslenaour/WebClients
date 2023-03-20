import { useCallback, useMemo, useRef, useState } from 'react';

import { c } from 'ttag';

import { type Maybe } from '@proton/pass/types';

import { SessionLockPinModal } from './SessionLockPinModal';

type Options = { title: string; text: string; onClose?: () => void };
class ConfirmSessionLockPinAbortedError extends Error {}

export const useConfirmSessionLockPin = () => {
    const pinResolver = useRef<Maybe<(pin: string) => void>>();
    const pinRejector = useRef<Maybe<(err: Error) => void>>();

    const [loading, setLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [options, setOptions] = useState<Options>({
        title: c('Title').t`Enter your Pin`,
        text: c('Info').t`Please enter your current pin code to continue`,
    });

    const abort = useCallback(() => {
        pinRejector.current?.(new ConfirmSessionLockPinAbortedError());
        setOpened(false);
    }, []);

    const Modal = useMemo(
        () => (
            <SessionLockPinModal
                open={opened}
                loading={loading}
                title={options.title}
                assistiveText={options.text}
                onSubmit={(pin) => pinResolver.current?.(pin)}
                onClose={abort}
            />
        ),
        [opened, loading, options]
    );

    const confirm = useCallback(async (callback: (pin: string) => any | Promise<any>, opts?: Partial<Options>) => {
        setOptions((prev) => ({ ...prev, ...(opts ?? {}) }));
        setOpened(true);

        try {
            const pin = await new Promise<string>((resolve, reject) => {
                pinResolver.current = resolve;
                pinRejector.current = reject;
            });

            setLoading(true);
            await callback(pin);
        } catch (e) {
            setLoading(false);

            if (!(e instanceof ConfirmSessionLockPinAbortedError)) {
                await confirm(callback, opts);
            } else {
                opts?.onClose?.();
            }
        } finally {
            setLoading(false);
            setOpened(false);
        }
    }, []);

    return [confirm, Modal] as const;
};
