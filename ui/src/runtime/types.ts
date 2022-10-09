
export type UUID = string

export type NodeT = {
    meta: NodeMeta
    value: NodeValue
}

export type NodeMeta = {
    id: UUID
    namespace: string
    name: string
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