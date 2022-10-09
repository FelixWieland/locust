import { createStore, produce } from "solid-js/store";
import { UUID, NodeT } from "./types";

type Nodes = Record<UUID, NodeT>

export const [nodes, updateNodes] = createStore<Nodes>({})

export let dropIds = [];

updateNodes(produce(o => {
    for (let i = 0; i < 100; i++) {
        const id = btoa(Math.random().toString()).substring(10, 15);
        dropIds.push(id)
        o[id] = {
            meta: {
                id,
                name: id,
                namespace: "/",
            },
            value: {
                timestamp: Date.now(),
                value: 0
            }
        }
    }
}))

