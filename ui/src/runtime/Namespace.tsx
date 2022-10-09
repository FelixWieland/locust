import { JSX } from "solid-js/jsx-runtime"
import { NodeMeta } from "./types"

type NamespaceProps = {
    namespace: string
    children: (data: Array<NodeMeta>) => JSX.Element
}

function Namespace(props: NamespaceProps) {
    return <div></div>
}

export {
    Namespace
}