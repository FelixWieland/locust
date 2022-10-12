import { createMemo } from "solid-js"
import { connectionState, latency } from "../store"
import { ConnectionState } from "../types"


function LatencyIndicator() {

    const content = createMemo(() => {
        switch (connectionState()) {
        case ConnectionState.CONNECTING: return <>Connecting ...</>
        case ConnectionState.CONNECTED: return <>{latency() || '-'}ms</>
        case ConnectionState.ERROR: return <>Server not available</>
        }
    })

    return (
        <span 
            class="bg-teal-700 text-white ml-3 text-sm font-medium mr-2 px-2.5 py-0.5 translate-y-2 rounded"
            classList={{
                'bg-yellow-500': connectionState() === ConnectionState.CONNECTING,
                'bg-teal-700': connectionState() === ConnectionState.CONNECTED,
                'bg-red-700': connectionState() === ConnectionState.ERROR,
            }}
        >
            {content()}
        </span>
    )
}

export {
    LatencyIndicator
}