import { Accessor, createMemo, createSignal, JSX } from 'solid-js'
import { NodeDataMimeTypes, NodeT, UUID } from './types'
import { connection, nodes, updateNodes } from './store'
import { produce } from 'solid-js/store'
import { UpdateNodeValue } from './api/messages'
import { Any } from './api/google/protobuf/any'
import { Serialize } from './mime'

type NodeIdentification = {
    id: UUID
}

type NodeProps = {
    children: (data: NodeData) => JSX.Element
} & NodeIdentification

type NodeData = {
    node: Accessor<NodeT>
    updateValue: {
        raw: (data: any, mimeType?: NodeDataMimeTypes) => void;
        text: (data: string) => void;
        number: (data: number) => void;
        boolean: (data: boolean) => void;
        json: (data: object) => void;
        textCsv: (data: string) => void;
        textJavascript: (data: string) => void;
        textHtml: (data: string) => void;
        applicationXml: (data: XMLDocument) => void;
        imageJpeg: (data: any) => void;
        imagePng: (data: any) => void;
        imageSvgXml: (data: SVGElement) => void;
    }
}

function node(id: UUID): NodeData | null {

    const unv = (data: Any) => {
        const up = UpdateNodeValue.create()
        up.id = id
        up.data = data
        connection()?.updateNodeValue(up)
    }

    const updateValue = {
        raw: (data: any, mimeType: NodeDataMimeTypes = '') => unv(Serialize.raw(data, mimeType)),
        text: (data: string) => unv(Serialize.text(data)),
        number: (data: number) => unv(Serialize.number(data)),
        boolean: (data: boolean) => unv(Serialize.boolean(data)),
        json: (data: object) => unv(Serialize.json(data)),
        textCsv: (data: string) => unv(Serialize.textCsv(data)),
        textJavascript: (data: string) => unv(Serialize.textJavascript(data)),
        textHtml: (data: string) => unv(Serialize.textHtml(data)),
        applicationXml: (data: XMLDocument) => unv(Serialize.applicationXml(data)),
        imageJpeg: (data: any) => unv(Serialize.imageJpeg(data)),
        imagePng: (data: any) => unv(Serialize.imagePng(data)),
        imageSvgXml: (data: SVGElement) => unv(Serialize.imageSvgXml(data))
    }

    const nodeData = createMemo(() => {
        return nodes[id] || null
    })

    if (nodeData() == null) {
        return null
    } else {
        return {
            node: nodeData,
            updateValue: updateValue
        }
    }
}

function Node(props: NodeProps) {
    const id = props.id
    const n = node(id)
    return n !== null ? props.children(n) : null
}

export {
    Node
}