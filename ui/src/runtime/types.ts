import { Any } from "./api/google/protobuf/any"
import { Timestamp } from "./api/google/protobuf/timestamp"
import { Parse } from "./mime"

export type UUID = string

export type NodeT = {
    id: UUID
    value?: NodeValue
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
    private _timestamp: number
    private _value: Any

    constructor(ts: Timestamp, value: Any) {
        this._timestamp = Math.floor(new Date(Number(ts.seconds) * 1000 + (Math.floor(ts.nanos / 1000))).valueOf() / 1000)
        this._value = value
    }

    mime(): NodeDataMimeTypes {
        return this._value.typeUrl as NodeDataMimeTypes
    }

    timestamp() {
        return this._timestamp
    }

    raw() {
        return Parse.raw(this._value)
    }

    text() {
        return Parse.text(this._value)
    }

    number() {
        return Parse.number(this._value)
    }

    boolean() {
        return Parse.boolean(this._value)
    }

    json<T = any>() {
        return Parse.json<T>(this._value)
    }

    textCsv() {
        return Parse.textCsv(this._value)
    }

    textJavascript() {
        return Parse.textJavascript(this._value)
    }

    textHtml() {
        return Parse.textHtml(this._value)
    }

    applicationXml() {
        return Parse.applicationXml(this._value)
    }

    imageJpeg() {
        return Parse.imageJpeg(this._value)
    }

    imagePng() {
        return Parse.imagePng(this._value)
    }

    imageSvgXml() {
        return Parse.imageSvgXml(this._value)
    }
}
