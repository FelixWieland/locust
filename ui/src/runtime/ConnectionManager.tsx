import { createEffect, createSignal, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { apiClient } from "./api/api.client"
import { StreamRequests, ConnectionID } from './api/messages';
import { Sidebar } from "./Sidebar"
import { Connection } from './connection'

import {GrpcWebFetchTransport} from "@protobuf-ts/grpcweb-transport";
import { ConnectionState, UUID } from "./types";

type ConnectionProps = {
    endpoint: string
}

const [connection, setConnection] = createStore<null | Connection>(null)

/**
 * Connection manages the connection to a locust server
 * There is only one connection allowed (per tab)
 */
function ConnectionManager(props: ConnectionProps) {
    const [open, setOpen] = createSignal(false)
    const [connectionState, setConnectionState] = createSignal(ConnectionState.CONNECTING)

    const transport = new GrpcWebFetchTransport({
        baseUrl: props.endpoint
    });

    const apiServer = new apiClient(transport)

    
    function startConnection() {
        let c: Connection | null = null
        setConnectionState(ConnectionState.CONNECTING)

        const requests = StreamRequests.create()
        const stream = apiServer.stream(requests)
        stream.responses.onError((err) => {
            c?.die()
            console.log(err)
            setConnection(null)
            setConnectionState(ConnectionState.ERROR)
            setTimeout(() => {
                startConnection()
            }, 2000)
        })
        stream.responses.onComplete(() => {
            c?.die()
            setConnection(null)
            setConnectionState(ConnectionState.ERROR)
            setTimeout(() => {
                startConnection()
            }, 2000)
        })
        // stream.responses.onNext(console.log)
        stream.responses.onMessage((message) => {
            message.responses.forEach(response => {
                if (response.data.oneofKind === "connectionID") {
                    // WHY THE FUCK DO I NEED TO DO THIS TYPESCRITP????!=!"§="I§ HOLY
                    const data = (response.data as unknown as any).connectionID as ConnectionID
                    c = new Connection(data.id, apiServer)
                    setConnection(connection)
                    setConnectionState(ConnectionState.CONNECTED)
                }
                if (c !== null) {
                    c.onResponse(response)
                }
            })
        })
    }

    startConnection()

    onCleanup(() => {
        connection?.die()
        setConnection(null)
    })

    return (<>
        <span class="h-6 w-6 rounded-full shadow fixed top-3 left-3 group hover:cursor-pointer z-50" onClick={() => setOpen(o => !o)}>
            <span
                class="absolute inline-flex h-full w-full rounded-full opacity-75"
                classList={{
                    'bg-yellow-500': connectionState() === ConnectionState.CONNECTING,
                    'bg-teal-700': connectionState() === ConnectionState.CONNECTED,
                    'bg-red-700': connectionState() === ConnectionState.ERROR,
                    'animate-ping': connectionState() === ConnectionState.CONNECTING || connectionState() === ConnectionState.CONNECTED
                }}
           />
            <span
                class="relative inline-flex rounded-full h-6 w-6 mb-0.5 opacity-90"
                classList={{
                    'bg-yellow-500': connectionState() === ConnectionState.CONNECTING,
                    'bg-teal-700': connectionState() === ConnectionState.CONNECTED,
                    'bg-red-700': connectionState() === ConnectionState.ERROR,
                }}
            />
        </span>
        <Sidebar open={open()} />
    </>)
}

export {
    ConnectionManager as Connection,
    connection
}