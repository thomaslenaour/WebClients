export const safeRemoveChild = (parent: HTMLElement, child: HTMLElement) => {
    try {
        parent.removeChild(child);
    } catch (_) {}
};
