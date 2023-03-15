import { IFrameAppMessage, IFrameMessageWithSender } from '../../types/iframe';

export const IFrameMessageBroker = {
    postMessage: <T = {}>(message: IFrameMessageWithSender<IFrameAppMessage | T>) =>
        window.parent.postMessage(message, '*'),

    onContentScriptMessage: <DomainMessage extends { type?: string } = IFrameAppMessage>(
        messageHandler: (message: IFrameAppMessage | DomainMessage) => void
    ) => {
        /**
         * Webpack development server uses the postMessage API
         * under the hood and we to avoid processing such messages
         * when listening for content-script IFrameAppMessages
         */
        const handler = ({ data }: MessageEvent<IFrameAppMessage | DomainMessage>) => {
            if (data.type !== undefined && !data.type?.startsWith('webpack')) {
                messageHandler(data);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    },
    onInjectedFrameMessage: <DomainMessage extends { type?: string } = IFrameAppMessage>(
        endpoint: string,
        messageHandler: (message: IFrameMessageWithSender<IFrameAppMessage | DomainMessage>) => void
    ) => {
        /**
         * Allows registering an iframe message listener for a
         * specific injected iframe app : catches all posted
         * messages but ignores if origins don't match
         */
        const handler = ({ data }: MessageEvent<IFrameMessageWithSender<IFrameAppMessage | DomainMessage>>) => {
            if (data.sender === endpoint && data.type !== undefined) {
                messageHandler(data);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    },
};
