import { Maybe } from '@proton/pass/types';

/**
 * Removing every listener from a DOM node
 * can be achieved by cloning the node and
 * replacing it in-place
 */
export const removeListeners = (el: HTMLElement): void => {
    el.replaceWith(el.cloneNode(true));
};

export type Listener =
    | {
          kind: 'listener';
          fn: (e: Event) => void;
          element: HTMLElement | Document | Window;
          type: keyof HTMLElementEventMap | keyof WindowEventMap | keyof DocumentEventMap;
      }
    | {
          kind: 'observer';
          observer: MutationObserver;
      };

export type ListenerStore = ReturnType<typeof createListenerStore>;

export const createListenerStore = () => {
    const listeners: Listener[] = [];

    const addListener = <T extends Maybe<Window | Document | HTMLElement>>(
        element: T,
        type: keyof HTMLElementEventMap | keyof WindowEventMap | keyof DocumentEventMap,
        fn: (e: Event) => void
    ) => {
        if (element !== undefined) {
            listeners.push({ kind: 'listener', element, type, fn });
            element.addEventListener(type, fn);
        }
    };

    const addObserver = (mutationCb: MutationCallback, target: Node, options?: MutationObserverInit) => {
        const observer = new MutationObserver(mutationCb);
        listeners.push({ kind: 'observer', observer });
        observer.observe(target, options);
    };

    const removeAll = () => {
        listeners.forEach((listener) => {
            if (listener.kind === 'listener') {
                listener.element.removeEventListener(listener.type, listener.fn);
            }

            if (listener.kind === 'observer') {
                listener.observer.disconnect();
            }
        });
    };

    return {
        addListener,
        addObserver,
        removeAll,
    };
};
