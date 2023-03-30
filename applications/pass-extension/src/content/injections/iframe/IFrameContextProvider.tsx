/* eslint-disable curly */
import { type FC, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import browser from 'webextension-polyfill';

import { Maybe, WorkerState } from '@proton/pass/types';
import noop from '@proton/utils/noop';

import {
    IFrameEndpoint,
    IFrameMessage,
    IFrameMessageType,
    IFrameMessageWithSender,
    IFramePortMessageHandler,
} from '../../types';

type IFrameContextValue = {
    workerState: Maybe<Omit<WorkerState, 'UID'>>;
    port: Maybe<browser.Runtime.Port>;
    closeIFrame: () => void;
    postMessage: (message: IFrameMessage) => void;
    registerHandler: <M extends IFrameMessage['type']>(type: M, handler: IFramePortMessageHandler<M>) => void;
};

const IFrameContext = createContext<IFrameContextValue>({
    workerState: undefined,
    port: undefined,
    closeIFrame: noop,
    postMessage: noop,
    registerHandler: noop,
});

export const IFrameContextProvider: FC<{ endpoint: IFrameEndpoint }> = ({ endpoint, children }) => {
    /* ensure sub iframe apps are not accessible if not in an iframe */
    if (window.self === window.top) window.close();

    const [port, setPort] = useState<browser.Runtime.Port>();
    const [workerState, setWorkerState] = useState<IFrameContextValue['workerState']>();

    useEffect(() => {
        const portInitHandler = (event: MessageEvent<Maybe<IFrameMessageWithSender>>) => {
            if (
                event.data !== undefined &&
                event.data?.type === IFrameMessageType.IFRAME_SET_PORT &&
                event.data.sender === 'content-script'
            ) {
                window.removeEventListener('message', portInitHandler);

                const message = event.data as Extract<
                    IFrameMessageWithSender,
                    { type: IFrameMessageType.IFRAME_SET_PORT }
                >;

                void browser.tabs.getCurrent().then((tab) => {
                    const port = browser.tabs.connect(tab.id!, { name: message.payload.portName, frameId: 0 });
                    port.postMessage({ sender: endpoint, type: IFrameMessageType.IFRAME_READY });
                    setPort(port);

                    port.onMessage.addListener((message: Maybe<IFrameMessage>) => {
                        switch (message?.type) {
                            case IFrameMessageType.IFRAME_INIT: {
                                return setWorkerState(message.payload.workerState);
                            }
                        }
                    });
                });
            }
        };

        window.addEventListener('message', portInitHandler);

        return () => {
            port?.disconnect();
            window.removeEventListener('message', portInitHandler);
        };
    }, [endpoint]);

    const postMessage = useCallback(
        (rawMessage: IFrameMessage) => {
            const message: IFrameMessageWithSender = { ...rawMessage, sender: endpoint };
            port?.postMessage(message);
        },
        [port]
    );

    const closeIFrame = useCallback(() => postMessage({ type: IFrameMessageType.IFRAME_CLOSE }), [postMessage]);

    const registerHandler = useCallback(
        <M extends IFrameMessage['type']>(type: M, handler: IFramePortMessageHandler<M>) => {
            const onMessageHandler = (message: Maybe<IFrameMessageWithSender>) => {
                if (message?.type === type && message.sender === 'content-script') {
                    handler(message as IFrameMessageWithSender<M>);
                }
            };

            port?.onMessage.addListener(onMessageHandler);
            return () => port?.onMessage.removeListener(onMessageHandler);
        },
        [port]
    );

    const context = useMemo<IFrameContextValue>(
        () => ({ port, closeIFrame, postMessage, registerHandler, workerState }),
        [port, workerState, closeIFrame, postMessage, registerHandler]
    );

    return <IFrameContext.Provider value={context}>{children}</IFrameContext.Provider>;
};

export const useIFrameContext = () => useContext(IFrameContext);

export const useRegisterMessageHandler = <M extends IFrameMessage['type']>(
    type: M,
    handler: IFramePortMessageHandler<M>
) => {
    const { registerHandler } = useIFrameContext();
    useEffect(() => registerHandler(type, handler), [type, handler, registerHandler]);
};
