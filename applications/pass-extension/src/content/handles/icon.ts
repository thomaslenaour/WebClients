import { Maybe } from '@proton/pass/types';
import { createListenerStore } from '@proton/pass/utils/listener';

import { EXTENSION_PREFIX, ICON_CLASSNAME } from '../constants';
import CSContext from '../context';
import { applyInjectionStyles, cleanupInjectionStyles, createIcon } from '../injections/icon';
import { createCircleLoader } from '../injections/icon/loader';
import { DropdownAction, FieldHandles, FieldIconHandles } from '../types';

type CreateIconOptions = { field: FieldHandles };
type IconHandlesContext = { loading: boolean; timer: Maybe<NodeJS.Timeout> };

const handleIconClick = (field: FieldHandles) => (action: DropdownAction) => {
    const dropdown = CSContext.get().iframes.dropdown;
    return dropdown.getState().visible ? dropdown.close() : dropdown.open({ action, field });
};

export const createFieldIconHandles = ({ field }: CreateIconOptions): FieldIconHandles => {
    const ctx: IconHandlesContext = { loading: false, timer: undefined };

    const context = CSContext.get();
    const listeners = createListenerStore();

    const loader = createCircleLoader();
    const input = field.element as HTMLInputElement;
    const inputBox = field.boxElement;
    const { icon, wrapper } = createIcon(field);

    const setActive = (active: boolean) => {
        icon.classList[active ? 'remove' : 'add'](`${ICON_CLASSNAME}--disabled`);
    };

    const setCount = (count: number) => {
        const safeCount = count === 0 || !count ? '' : String(count);
        icon.style.setProperty(`--${EXTENSION_PREFIX}-items-count`, `"${safeCount}"`);
    };

    const setLoading = (loading: boolean) => {
        clearTimeout(ctx.timer);

        ctx.timer = setTimeout(() => {
            try {
                icon.classList[loading ? 'add' : 'remove'](`${ICON_CLASSNAME}--loading`);
                icon[loading ? 'appendChild' : 'removeChild'](loader);
            } catch (_) {}
        }, 50);

        ctx.loading = loading;
    };

    const clickHandler = handleIconClick(field);

    const handleResize = () => {
        cleanupInjectionStyles({ input, wrapper });
        applyInjectionStyles({ input, wrapper, inputBox, icon });
    };

    listeners.addListener(window, 'resize', handleResize);
    setActive(context.state.loggedIn);

    return {
        element: icon,
        setActive,
        setCount,
        setLoading,
        setOnClickAction: (action) => {
            listeners.addListener(icon, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return !ctx.loading && clickHandler(action);
            });
        },
        detach: () => {
            cleanupInjectionStyles({ input, wrapper });
            listeners.removeAll();
            icon.parentElement?.remove();
        },
    };
};
