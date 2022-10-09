import { UUID } from "./util"

export type DropT = {
    id: UUID
    namespace: string
    name: string

    value: DropValue
}

export type DropValue = {
    value: any
    timestamp: number
}