import { WorkerState } from '@proton/pass/types';

export type IFrameState = {
    visible: boolean;
    ready: boolean;
};

export interface IFrameApp<DomainMessage> {
    element: HTMLIFrameElement;
    state: IFrameState;
    open: (scrollRef?: HTMLElement) => void;
    close: () => void;
    reset: (workerState: WorkerState) => void;
    sendMessage: (message: IFrameAppMessage | DomainMessage) => void;
}
export interface IFrameService<DomainMessage = {}, OpenOptions = {}> {
    getState: () => IFrameState;
    sendMessage: (message: DomainMessage | IFrameAppMessage) => void;
    open: (options: OpenOptions) => void;
    close: () => void;
    reset: (state: WorkerState) => void;
}

export enum IFrameAppMessageType {
    READY = 'IFRAME_READY',
    INIT = 'IFRAME_INIT',
    OPEN = 'IFRAME_OPEN',
    CLOSE = 'IFRAME_CLOSE',
    DIMENSIONS = 'IFRAME_DIMENSIONS',
}

export type IFrameMessageWithOrigin<T> = T & { origin: string };

export type IFrameAppMessage =
    | {
          type: IFrameAppMessageType.READY;
      }
    | {
          type: IFrameAppMessageType.INIT;
          payload: { workerState: WorkerState };
      }
    | {
          type: IFrameAppMessageType.OPEN;
      }
    | {
          type: IFrameAppMessageType.CLOSE;
      }
    | {
          type: IFrameAppMessageType.DIMENSIONS;
          payload: { height: number; width?: number };
      }
    | { type: undefined };
