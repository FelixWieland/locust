
export type UUID = string

export type NodeT = {
    id: UUID
    value?: NodeValue
}

export type NodeValue = {
    value: any
    timestamp: number
}

export enum ConnectionState {
    CONNECTING,
    CONNECTED,
    ERROR
}

export type ConnectionOptions = {
    endpoint: string
    session?: boolean,

    storage?: Storage

    sidebar?: {
        disabled?: boolean,
        open?: boolean,
        
    },
}

interface Storage {
    getItem(key: string): string
    setItem(key: string, value: string): void
}