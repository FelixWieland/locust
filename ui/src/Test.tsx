import { createMemo, createSignal, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { allNodes, connection, session } from "./runtime/store";
import { Node } from "./runtime/Node"
import { ControlledInput } from "./ControlledInput";

function Test() {

    return (
        <div class="h-screen w-full p-4 sizing overflow-scroll">
            <div class="h-full w-full p-4 bg-white rounded shadow relative">
                {connection() && (
                    <button class="bg-teal-700 p-4 rounded-xl shadow-xl text-white absolute right-4 bottom-4 hover:bg-teal-900" onClick={() => connection().createNode()}>
                        Create node
                    </button>
                )}
                <For each={allNodes()}>{(node) => <Node id={node.id}>{
                    ({
                        node,
                        updateValue
                    }) => <>
                            <div>
                                <label for="endpoint" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Node: {node().id}</label>
                                <ControlledInput
                                    value={node().value().text()}
                                    disabled={!connection()}
                                    onChange={updateValue.text}
                                />
                            </div>
                        </>
                }</Node>}</For>
            </div>
        </div>
    )
}

export {
    Test
}