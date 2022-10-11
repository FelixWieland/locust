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

export type ConnectionOptions = {
    endpoint: string

    session?: {
        aquire?: boolean,
        token?: string
        storage?: Storage
    }

    sidebar?: {
        disabled?: boolean,
        open?: boolean,
    },
}

export interface Storage {
    getItem(key: string): string
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
