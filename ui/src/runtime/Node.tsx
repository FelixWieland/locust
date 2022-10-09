import { createMemo, JSX } from 'solid-js'
import { NodeT, NodeValue, UUID } from './types'
import { nodes, updateNodes } from './store'
import { produce } from 'solid-js/store'

type NodeIdentification = {
    id: UUID
}

type NodeProps = {
    children: (data: NodeData) => JSX.Element
} & NodeIdentification

type NodeData = {
    node: NodeT
    updateValue: (newValue: NodeValue) => void
}

function Node(props: NodeProps) {
    const id = props.id

    const updateValue = (newValue: NodeValue) => {
        updateNodes(produce(nodes => {
            nodes[id].value = newValue
        }))
    }

    const child = createMemo(() => {
        const node = nodes[id]
        return node ? props.children({
            node,
            updateValue
        }) : null
    });
    return child
}

export {
    Node
}