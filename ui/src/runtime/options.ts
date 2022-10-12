import { Options } from "./types";

export const defaultOptions = {
    requestBatchMs: 500,
    requestDebounceMs: 150,
    sessionAquire: true,
    sidebarDisabled: false,
    storage: localStorage,
    token: undefined,
    sidebarOpen: false
} as unknown as Options