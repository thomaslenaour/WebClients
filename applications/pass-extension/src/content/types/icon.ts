import { DropdownAction } from './dropdown';

export interface FieldIconHandles {
    element: HTMLElement;
    setActive: (active: boolean) => void;
    setCount: (count: number) => void;
    setLoading: (loading: boolean) => void;
    setOnClickAction: (action: DropdownAction) => void;
    detach: () => void;
}
