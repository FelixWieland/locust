import { createMemo, createSignal } from "solid-js"
import { Any } from "./api/google/protobuf/any"
import { Parse } from "./mime"
import { NodeDataMimeTypes } from "./types"

export function NodeValue(ts?: number, value?: Any) {
    const [read, set] = createSignal({
        _timestamp: ts,
        _value: value,
    })

    const def = createMemo(() => <T>(fn: (a: Any) => T, def: T) => read()._value ? fn(read()._value!) : def)

    return createMemo(() => ({
        read: read,
        set: set,
        mime: () => (read()._value ? read()._value!.typeUrl : '') as NodeDataMimeTypes,
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
