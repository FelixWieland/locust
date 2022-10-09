import { For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { dropIds } from "./runtime/store";
import { Node } from "./runtime/Node"

function StoreTest() {
    return (
        <For each={dropIds}>{(id) => {
            return <Node id={id}>{
                ({
                    node,
                    updateValue
                }) => <p>{node.meta.id}: {node.value.timestamp} <button onClick={() => updateValue({
                    value: 0,
                    timestamp: Date.now(),
                })}>
                    Update
                </button></p>
            }</Node>
        }}</For>
    )
}

export {
    StoreTest
}