import { createMemo, createSignal, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { allNodes, connection, session } from "./runtime/store";
import { Node } from "./runtime/Node"
import { ControlledInput } from "./ControlledInput";

function StoreTest() {
    const [test, setTest] = createSignal(0)
    setInterval(() => {
        setTest(o => o + 1)
    }, 1000)

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
                <br />
                Subscribed node ids: {session().subscribedNodesIDs.join(', ')}
            </p>
        )}
        {/* <For each={allNodes()}>{(node) => {
            return <Node id={node.id}>{
                ({
                    node,
                    updateValue
                }) => <p>{node().id}: {`${node().value?.number()} ${node().value?.timestamp()}`} <button onClick={() => updateValue.number(1)}>
                    Update
                </button></p>
            }</Node>
        }}</For> */}
        <For each={allNodes()}>{(node) => <Node id={node.id}>{
            ({
                node,
                updateValue
            }) => <>
                    <div>
                        <label for="endpoint" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Node: {node().id}</label>
                        <ControlledInput 
                            value={node().value.text() || ''}
                            disabled={!connection()}
                            onChange={updateValue.text}
                        />
                    </div>

                </>
        }</Node>}</For>
    </div>)
}

export {
    StoreTest
}