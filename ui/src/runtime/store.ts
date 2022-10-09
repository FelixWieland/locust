import { createStore, produce } from "solid-js/store";
import { DropT } from "./drop";
import { UUID } from "./util";

type Drops = Record<UUID, DropT>

export const [drops, updateDrops] = createStore<Drops>({})

export let dropIds = [];

updateDrops(produce(o => {
    for (let i = 0; i < 100; i++) {
        const id = btoa(Math.random().toString()).substring(10,15);
        dropIds.push(id)
        o[id] = {
            id,
            name: id,
            namespace: "/",
            value: {
                timestamp: Date.now(),
                value: 0
            }
        }
    }
}))

