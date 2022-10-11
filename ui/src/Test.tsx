import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { allNodes, connection, session } from "./runtime/store";
import { Node } from "./runtime/Node"
import { ControlledInput } from "./ControlledInput";

function Test() {
    return (
        <div class="h-screen w-full p-4 sizing overflow-scroll">
            <div class="h-full w-full p-4 bg-white dark:bg-zinc-800 rounded shadow relative">
                {connection() && (
                    <button class="bg-teal-700 p-4 rounded-xl shadow-xl text-white absolute right-4 bottom-4 hover:bg-teal-900 transition-colors" onClick={() => connection().createNode()}>
                        Create node
                    </button>
                )}
                <Node id={"ae8856fa-7a7f-41dc-865d-799d8a8525f7"}>{
                    ({
                        node
                    }) => <div>
                            {node().id}
                        </div>
                }</Node>
                <For each={allNodes()}>{(node) => <Node id={node.id}>{
                    ({
                        node,
                        updateValue,
                        subscribed,
                        unsubscribe
                    }) => <Show when={subscribed()}>
                            <div class="p-2 border mb-2 rounded-lg bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600 shadow-sm relative">
                                <button class="absolute right-1 top-1 rounded bg-teal-700 w-6 h-6 text-white hover:bg-teal-900 transition-colors" onClick={unsubscribe}>
                                    X
                                </button>
                                <label for="endpoint" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Node: {node().id}</label>
                                <ControlledInput
                                    value={node().value().text()}
                                    disabled={!connection()}
                                    onChange={updateValue.text}
                                />
                            </div>
                        </Show>
                }</Node>}
                </For>
            </div>
        </div>
    )
}

export {
    Test
}