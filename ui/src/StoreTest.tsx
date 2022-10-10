import { createMemo, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { allNodes, connection, session } from "./runtime/store";
import { Node } from "./runtime/Node"

function StoreTest() {
    return (<div class="h-screen w-full p-4 overflow-scroll">
        {connection() && (
            <button class="bg-teal-700 p-4 rounded text-white" onClick={() => connection().createNode()}>
                Create node
            </button>
        )}
        {session() && (
            <p class="mb-5">
                Session token: {session().sessionToken}
                <br />
                Active connections: {session().activeConnections}
            </p>
        )}
        <For each={allNodes()}>{(node) => {
            return <Node id={node.id}>{
                ({
                    node,
                    updateValue
                }) => <p>{node().id}: {`${node().value?.number()}`} <button onClick={() => updateValue.number(1)}>
                    Update
                </button></p>
            }</Node>
        }}</For>
    </div>)
}

export {
    StoreTest
}