import { onCleanup } from "solid-js";

export type Shortcut = {
    key: string,
    meta: boolean,
    description: string
}

function shortcut(event: KeyboardEvent, key: KeyboardEvent['key'], metaKey: boolean, action: () => void) {
    if (event.key === key && event.metaKey === metaKey) {
        try {
            action();
        } catch {}
        if (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else if (window.event) {
                window.event.cancelBubble = true;
            }
        }
        event.preventDefault();
        return false
    }
    return true 
}

function registerShortcut(key: KeyboardEvent['key'], metaKey: boolean, action: () => void, description: string = '-') {
    const onKeyDown = (event: KeyboardEvent) => shortcut(event, key, metaKey, action)
    window.addEventListener('keydown', onKeyDown)
    onCleanup(() => window.addEventListener('keydown', onKeyDown))
}

export {
    shortcut,
    registerShortcut
}