import { createMemo, JSX } from 'solid-js'
import { UUID } from './util'
import { DropT, DropValue } from './drop'
import { drops, updateDrops } from './store'
import { produce } from 'solid-js/store'

type DropIdentification = {
    id: UUID
} | {
    namespace: string,
    name: string
}

type DropProps = {
    children: (data: DropData) => JSX.Element
} & DropIdentification

type DropData = {
    drop: DropT
    updateValue: (newValue: DropValue) => void
}

export function Drop(props: DropProps) {
    const id = (props as any).id as UUID

    const updateValue = (newValue: DropValue) => {
        updateDrops(produce(drops => {
            drops[id].value = newValue
        }))
    }

    const child = createMemo(() => {
        const drop = drops[id]
        return drop ? props.children({
            drop,
            updateValue
        }) : null
    });
    return child
}