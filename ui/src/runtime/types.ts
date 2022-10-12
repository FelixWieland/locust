import { Accessor, createEffect, createMemo, createSignal, Setter } from "solid-js"
import { Any } from "./api/google/protobuf/any"
import { Timestamp } from "./api/google/protobuf/timestamp"
import { Parse } from "./mime"
import { NodeValue } from "./node_value"

export type UUID = string

export type NodeT = {
    id: UUID
    value: ReturnType<typeof NodeValue>
}

export enum ConnectionState {
    CONNECTING,
    CONNECTED,
    ERROR
}

export type Options = {
    endpoint: string

    requestBatchMs: number,
    requestDebounceMs: number

    sessionAquire: boolean,
    sessionToken?: string
    
    storage: Storage

    sidebarDisabled: boolean
    sidebarOpen: boolean
}

export type PartialOptions = Partial<Options> & {
    endpoint: string
}

export interface Storage {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
}

export const allNodeDataMimeTypes = [
    '',
    'text',
    'number',
    'boolean',
    'json',
    'text/csv',
    'text/javascript',
    'text/html',
    'application/xml',
    'image/jpeg',
    'image/png',
    'image/svg+xml'
] as const

export type NodeDataMimeTypes = typeof allNodeDataMimeTypes[number]