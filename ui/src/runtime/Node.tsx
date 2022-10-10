import { Accessor, createMemo, createSignal, JSX } from 'solid-js'
import { NodeT, NodeValue, UUID } from './types'
import { connection, nodes, updateNodes } from './store'
import { produce } from 'solid-js/store'
import { UpdateNodeValue } from './api/messages'

type NodeIdentification = {
    id: UUID
}

type NodeProps = {
    children: (data: NodeData) => JSX.Element
} & NodeIdentification

type NodeData = {
    node: Accessor<NodeT>
    updateValue: (value: any) => void
}

function node(id: UUID): NodeData | null {

    const updateValue = (value: any) => {
        const up = UpdateNodeValue.create()
        up.id = id
        up.data = {
            typeUrl: '',
            value: Uint8Array.from([value])
        }
        connection()?.updateNodeValue(up)
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