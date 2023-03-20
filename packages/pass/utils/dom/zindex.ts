export const inferZIndexFromParent = (el: HTMLElement): number => {
    const parent = el.parentElement;

    if (!parent) {
        return 0;
    }

    const zIndex = window.getComputedStyle(parent).getPropertyValue('z-index');
    const value = parseInt(zIndex, 10);
    return isNaN(value) ? inferZIndexFromParent(parent) : value;
};

export const getMaxZIndex = (rootElement: HTMLElement) => {
    return Math.max(
        inferZIndexFromParent(rootElement),
        ...Array.from(rootElement.querySelectorAll('*'), (el) =>
            parseInt(window.getComputedStyle(el).zIndex, 10)
        ).filter((zIndex) => !Number.isNaN(zIndex)),
        0
    );
};
