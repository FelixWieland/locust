import { Accessor, createEffect, createMemo, createSignal, Setter } from "solid-js"
import { Any } from "./api/google/protobuf/any"
import { Timestamp } from "./api/google/protobuf/timestamp"
import { Parse } from "./mime"

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

export function NodeValue(ts?: number, value?: Any) {
    const [read, set] = createSignal({
        _timestamp: ts,
        _value: value,
    })

    const def = createMemo(() => <T>(fn: (a: Any) => T, def: T) => read()._value ? fn(read()._value) : def)

    return createMemo(() => ({
        read: read,
        set: set,
        mime: () => (read()._value ? read()._value.typeUrl : '') as NodeDataMimeTypes,
        timestamp: () => (read()._timestamp ? this.read()._timestamp : -1),
        raw: () => def()(Parse.raw, new Uint8Array()),
        text: () => def()(Parse.text, ''),
        number: () => def()(Parse.number, NaN),
        boolean: () => def()(Parse.boolean, null),
        json: <T = any>() => def()(Parse.json, null) as T,
        textCsv: () =>def()(Parse.textCsv, ''),
        textJavascript: () => def()(Parse.textJavascript, ''),
        textHtml: () => def()(Parse.textHtml, ''),
        applicationXml: () => def()(Parse.applicationXml, null),
        imageJpeg: () => def()(Parse.imageJpeg, new Uint8Array()),
        imagePng: () => def()(Parse.imagePng, new Uint8Array()),
        imageSvgXml: () => def()(Parse.imageSvgXml, null)
    }))
}
