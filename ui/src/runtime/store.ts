import { createMemo, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Session } from "./api/messages";
import { Connection } from "./connection";
import { UUID, NodeT, Storage } from "./types";

type Nodes = Record<UUID, NodeT>

export const [nodes, updateNodes] = createStore<Nodes>({})
export const [connection, setConnection] = createSignal<null | Connection>(null)
export const [latency, setLatency] = createSignal<null | number>(null)
export const [session, setSession] = createSignal<null | Session>(null)

export const allNodes = createMemo(() => Object.keys(nodes).map(key => nodes[key]))

export const readSessionToken = (storage: Storage) => storage.getItem("_locust_session_token")
export const writeSessionToken = (token: string, storage: Storage) => storage.setItem("_locust_session_token", token)
// export let dropIds = [];

// updateNodes(produce(o => {
//     for (let i = 0; i < 100; i++) {
//         const id = btoa(Math.random().toString()).substring(10, 15);
//         dropIds.push(id)
//         o[id] = {
//             id,
//             value: {
//                 timestamp: Date.now(),
//                 value: 0
//             }
//         }
//     }
// }))

