import { For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { dropIds } from "./runtime/store";
import { Drop } from "./runtime/Components"

function StoreTest() {
    return (
        <For each={dropIds}>{(id) => {
            return <Drop id={id}>{
                ({
                    drop,
                    updateValue
                }) => <p>{drop.id}: {drop.value.timestamp} <button onClick={() => updateValue({
                    value: 0,
                    timestamp: Date.now(),
                })}>
                    Update
                </button></p>
            }</Drop>
        }}</For>
    )
}

export {
    StoreTest
}