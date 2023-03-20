import { Maybe, WorkerState } from '@proton/pass/types';
import { createElement, pixelEncoder } from '@proton/pass/utils/dom';
import { createListenerStore } from '@proton/pass/utils/listener';
import { logger } from '@proton/pass/utils/logger';
import { merge } from '@proton/pass/utils/object';

import { EXTENSION_PREFIX } from '../../constants';
import { IFrameApp, IFrameAppMessage, IFrameAppMessageType } from '../../types/iframe';
import { createIframeRoot } from './create-iframe-root';
import { IFrameMessageBroker } from './messages';

import './iframe.scss';

export type IframePosition = { top: number; left?: number; right?: number; zIndex?: number };
export type IframeDimensions = { width: number; height: number };

type CreateIFrameAppOptions = {
    id: string;
    src: string;
    animation: 'slidein' | 'fadein';
    classNames?: string[];
    backdropClose: boolean;
    backdropExclude?: () => HTMLElement[];
    onReady?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    getIframePosition: (iframeRoot: HTMLDivElement) => IframePosition;
    getIframeDimensions: () => IframeDimensions;
};

type IFrameAppState = { visible: boolean; ready: boolean };

export const createIFrameApp = <DomainMessage = {}>({
    id,
    src,
    animation,
    classNames = [],
    backdropClose,
    backdropExclude,
    onReady,
    onOpen,
    onClose,
    getIframePosition,
    getIframeDimensions,
}: CreateIFrameAppOptions): IFrameApp<DomainMessage> => {
    const iframeRoot = createIframeRoot();

    const state: IFrameAppState = { visible: false, ready: false };
    const listeners = createListenerStore();

    const iframe = createElement<HTMLIFrameElement>({
        type: 'iframe',
        classNames: [`${EXTENSION_PREFIX}-iframe`, ...classNames],
        attributes: { src },
        parent: iframeRoot,
    });

    iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-animation`, animation);

    const sendMessage = (message: IFrameAppMessage | DomainMessage) => {
        iframe.contentWindow?.postMessage(message, '*');
    };

    const setIframePosition = ({ top, left, right, zIndex }: IframePosition) => {
        iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-zindex`, `${zIndex ?? 1}`);
        iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-top`, pixelEncoder(top));
        iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-left`, left ? pixelEncoder(left) : 'unset');
        iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-right`, right ? pixelEncoder(right) : 'unset');
    };

    const setIframeDimensions = ({ width, height }: IframeDimensions) => {
        iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-width`, pixelEncoder(width));
        iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-height`, pixelEncoder(height));
    };

    const positionDropdown = () => setIframePosition(getIframePosition(iframeRoot));

    const close = (e?: Event) => {
        if (state.visible) {
            const target = e?.target as Maybe<HTMLElement> | null;

            if (!target || !backdropExclude?.().includes(target)) {
                listeners.removeAll();
                state.visible = false;
                onClose?.();

                iframe.classList.remove(`${EXTENSION_PREFIX}-iframe-visible`);
            }
        }
    };

    const open = (scrollRef?: HTMLElement) => {
        state.visible = true;
        iframe.classList.add(`${EXTENSION_PREFIX}-iframe-visible`);

        setIframeDimensions(getIframeDimensions());
        positionDropdown();

        listeners.addListener(window, 'resize', positionDropdown);
        listeners.addListener(scrollRef, 'scroll', () => requestAnimationFrame(positionDropdown));

        if (backdropClose) {
            listeners.addListener(window, 'mousedown', close);
        }

        sendMessage({ type: IFrameAppMessageType.OPEN });
        onOpen?.();
    };

    IFrameMessageBroker.onInjectedFrameMessage(id, (message) => {
        logger.debug(`[Iframe::${id}]: emitted "${message.type}"`);

        switch (message.type) {
            case IFrameAppMessageType.READY: {
                state.ready = true;
                return onReady?.();
            }
            case IFrameAppMessageType.DIMENSIONS: {
                const { width, height } = merge(getIframeDimensions(), { height: message.payload.height });
                return setIframeDimensions({ width, height });
            }
            case IFrameAppMessageType.CLOSE: {
                return close();
            }
            default:
                return;
        }
    });

    const reset = (workerState: WorkerState) => {
        close();
        sendMessage({
            type: IFrameAppMessageType.INIT,
            payload: { workerState },
        });
    };

    const app: IFrameApp<DomainMessage> = {
        element: iframe,
        state,
        sendMessage,
        reset,
        open,
        close,
    };

    return app;
};
