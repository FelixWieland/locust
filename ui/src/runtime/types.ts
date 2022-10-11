import { Any } from "./api/google/protobuf/any"
import { Timestamp } from "./api/google/protobuf/timestamp"
import { Parse } from "./mime"

export type UUID = string

export type NodeT = {
    id: UUID
    value: NodeValue
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

export class NodeValue {
    private _timestamp?: number
    private _value?: Any

    constructor(ts: Timestamp, value?: Any) {
        this._timestamp = ts ? Math.floor(new Date(Number(ts.seconds) * 1000 + (Math.floor(ts.nanos / 1000))).valueOf() / 1000) : undefined
        this._value = value
    }

    default<T>(fn: (a: Any) => T, def: T): T {
        return this._value ? fn(this._value) : def
    }

    mime(): NodeDataMimeTypes {
        return (this._value ? this._value.typeUrl : '') as NodeDataMimeTypes
    }

    timestamp() {
        return (this._timestamp ? this._timestamp : -1)
    }

    raw() {
        return this.default(Parse.raw, new Uint8Array())
    }

    text() {
        return this.default(Parse.text, '')
    }

    number() {
        return this.default(Parse.number, NaN)
    }

    boolean() {
        return this.default(Parse.boolean, null)
    }

    json<T = any>() {
        return this.default(Parse.json, null) as T
    }

    textCsv() {
        return this.default(Parse.textCsv, '');
    }

    textJavascript() {
        return this.default(Parse.textJavascript, '')
    }

    textHtml() {
        return this.default(Parse.textHtml, '')
    }

    applicationXml() {
        return this.default(Parse.applicationXml, null)
    }

    imageJpeg() {
        return this.default(Parse.imageJpeg, new Uint8Array())
    }

    imagePng() {
        return this.default(Parse.imagePng, new Uint8Array())
    }

    imageSvgXml() {
        return this.default(Parse.imageSvgXml, null)
    }
}
