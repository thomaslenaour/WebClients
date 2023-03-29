import uniqid from 'uniqid';
import browser from 'webextension-polyfill';

import type { Maybe, WorkerState } from '@proton/pass/types';
import { createElement, pixelEncoder, safeRemoveChild } from '@proton/pass/utils/dom';
import { waitUntil } from '@proton/pass/utils/fp';
import { createListenerStore } from '@proton/pass/utils/listener';
import { logger } from '@proton/pass/utils/logger';
import { merge } from '@proton/pass/utils/object';

import { ExtensionContext } from '../../../shared/extension';
import { EXTENSION_PREFIX } from '../../constants';
import type {
    IFrameApp,
    IFrameEndpoint,
    IFrameMessageWithSender,
    IFramePortMessageHandler,
    IFrameState,
} from '../../types/iframe';
import { IFrameMessage, IFrameMessageType } from '../../types/iframe';
import { createIframeRoot } from './create-iframe-root';

import './iframe.scss';

export type IframePosition = { top: number; left?: number; right?: number; zIndex?: number };
export type IframeDimensions = { width: number; height: number };

type CreateIFrameAppOptions = {
    id: IFrameEndpoint;
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

export const createIFrameApp = ({
    id,
    src,
    animation,
    classNames = [],
    backdropClose,
    backdropExclude,
    onOpen,
    onClose,
    getIframePosition,
    getIframeDimensions,
}: CreateIFrameAppOptions): IFrameApp => {
    const iframeRoot = createIframeRoot();

    const state: IFrameState = { visible: false, ready: false, loaded: false };
    const portMessageHandlers: Map<IFrameMessageType, IFramePortMessageHandler> = new Map();

    const listeners = createListenerStore();

    const iframe = createElement<HTMLIFrameElement>({
        type: 'iframe',
        classNames: [`${EXTENSION_PREFIX}-iframe`, ...classNames],
        attributes: { src },
        parent: iframeRoot,
    });

    iframe.style.setProperty(`--${EXTENSION_PREFIX}-iframe-animation`, animation);
    iframe.addEventListener('load', () => (state.loaded = true), { once: true });

    /**
     * Securing the posted message's allowed target origins.
     * Ensure the iframe has been correctly loaded before sending
     * out any message: the iframe.contentWindow::origin may be
     * incorrect otherwise.
     */
    const sendPostMessage = (rawMessage: IFrameMessage) => {
        const message: IFrameMessageWithSender = { ...rawMessage, sender: 'content-script' };
        void waitUntil(() => state.loaded, 100).then(() => iframe.contentWindow?.postMessage(message, iframe.src));
    };

    const sendPortMessage = (rawMessage: IFrameMessage) => {
        const message: IFrameMessageWithSender = { ...rawMessage, sender: 'content-script' };
        void waitUntil(() => state.ready, 100).then(() => state.port?.postMessage(message));
    };

    const registerMessageHandler = <M extends IFrameMessageType>(
        type: M,
        handler: (message: IFrameMessageWithSender<M>) => void
    ) => {
        const safeHandler = (message: Maybe<IFrameMessageWithSender>) =>
            message?.type === type && handler(message as IFrameMessageWithSender<M>);

        portMessageHandlers.set(type, safeHandler);
        return () => portMessageHandlers.delete(type);
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

        sendPortMessage({ type: IFrameMessageType.IFRAME_OPEN });
        onOpen?.();
    };

    const init = () => {
        const tabId = ExtensionContext.get().tabId;
        const portName = `iframe-${id}-${tabId}-${uniqid()}`;

        /* ⚠️ This should be the only postMessage sent */
        sendPostMessage({ type: IFrameMessageType.IFRAME_SET_PORT, payload: { portName } });

        browser.runtime.onConnect.addListener((port) => {
            if (port.name === portName) {
                state.port = port;

                logger.info(`[IFrame::CS] connected to secure port ${port.name}`);

                port.onMessage.addListener(
                    (message: Maybe<IFrameMessageWithSender>) =>
                        message?.type !== undefined && portMessageHandlers.get(message.type)?.(message)
                );
            }
        });
    };

    const reset = (workerState: WorkerState) => {
        close();
        sendPortMessage({ type: IFrameMessageType.IFRAME_INIT, payload: { workerState } });
    };

    const destroy = () => {
        listeners.removeAll();
        safeRemoveChild(iframeRoot, iframe);

        try {
            /* may-fail if context invalidated */
            state?.port?.disconnect();
        } catch (_) {}
    };

    registerMessageHandler(IFrameMessageType.IFRAME_READY, () => (state.ready = true));
    registerMessageHandler(IFrameMessageType.IFRAME_CLOSE, () => close());

    registerMessageHandler(IFrameMessageType.IFRAME_DIMENSIONS, (message) => {
        const { width, height } = merge(getIframeDimensions(), { height: message.payload.height });
        return setIframeDimensions({ width, height });
    });

    return {
        element: iframe,
        state,
        sendPostMessage,
        sendPortMessage,
        registerMessageHandler,
        reset,
        open,
        close,
        destroy,
        init,
    };
};
