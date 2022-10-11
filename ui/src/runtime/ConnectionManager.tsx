import { createEffect, createSignal, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { apiClient } from "./api/api.client"
import { StreamRequests, Connection as ConnectionT, StreamRequest, AquireSession, None } from './api/messages';
import { Sidebar } from "./Sidebar"
import { Connection } from './connection'

import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { ConnectionOptions, ConnectionState, UUID } from "./types";
import { connection, readSessionToken, setConnection } from "./store";

type ConnectionProps = {
    options: ConnectionOptions
    onOptionChange?: (newOptions: ConnectionOptions) => void
}

/**
 * Connection manages the connection to a locust server
 * There is only one connection allowed (per tab)
 */
function ConnectionManager(props: ConnectionProps) {
    const [open, setOpen] = createSignal(props.options.sidebar?.open || false)
    const [connectionState, setConnectionState] = createSignal(ConnectionState.CONNECTING)

    const transport = new GrpcWebFetchTransport({
        baseUrl: props.options.endpoint
    });

    const apiServer = new apiClient(transport)

    const onKeyDown = (event) => {
        if (event.key === 'b' && event.metaKey) {
            setOpen(o => !o)
        }
    }

    function aquireSession(): AquireSession {
        const aquireSession = AquireSession.create()
        const sessionToken = props.options.session?.token || readSessionToken(props.options.session?.storage || sessionStorage)
        if (!sessionToken) {
            aquireSession.data = {
                oneofKind: 'none',
                none: None
            }
        } else {
            aquireSession.data = {
                oneofKind: 'sessionToken',
                sessionToken: sessionToken
            }
        }
        return aquireSession
    }

    function getInitialRequests(): Array<StreamRequest> {
        const initialRequests: Array<StreamRequest> = []

        if (props.options.session?.aquire) {
            const sr = StreamRequest.create()
            const ar = aquireSession()
            sr.data = {
                oneofKind: 'aquireSession',
                aquireSession: ar
            }
            initialRequests.push(sr)
        }

        return initialRequests
    }

    function startConnection(options: ConnectionOptions) {
        let c: Connection | null = null
        setConnectionState(ConnectionState.CONNECTING)

        const requests = StreamRequests.create()

        requests.requests = getInitialRequests()

        const stream = apiServer.stream(requests)

        stream.responses.onError((err) => {
            console.log(err)
            setConnectionState(ConnectionState.ERROR)
            setConnection(null)
            try {
                c?.die()
            } catch { }
            setTimeout(() => {
                startConnection(options)
            }, 2000)
        })
        stream.responses.onComplete(() => {
            setConnectionState(ConnectionState.ERROR)
            setConnection(null)
            try {
                c?.die()
            } catch { }
            setTimeout(() => {
                startConnection(options)
            }, 2000)
        })
        // stream.responses.onNext(console.log)
        stream.responses.onMessage((message) => {
            message.responses.forEach(response => {
                if (response.data.oneofKind === "connection" && c === null) {
                    // WHY THE FUCK DO I NEED TO DO THIS TYPESCRITP????!=!"§="I§ HOLY
                    const data = (response.data as unknown as any).connection as ConnectionT
                    c = new Connection(data.id, apiServer, props.options)
                    setConnection(c)
                    setConnectionState(ConnectionState.CONNECTED)
                }
                if (c !== null) {
                    c.onResponse(response)
                }
            })
        })
    }

    document.addEventListener('keydown', onKeyDown)

    createEffect(() => {
        startConnection(props.options)
        onCleanup(() => {
            try {
                connection()?.die()
            } catch { }
            setConnection(null)
            setConnectionState(ConnectionState.ERROR)
        })
    })

    onCleanup(() => {
        try {
            connection()?.die()
        } catch { }
        setConnection(null)
        setConnectionState(ConnectionState.ERROR)
        document.removeEventListener('keydown', onKeyDown)
    })

    return (<>
        <span class="h-6 w-6 rounded-full shadow fixed top-3 left-3 group hover:cursor-pointer z-40" onClick={() => setOpen(o => !o)}>
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
        {!props.options.sidebar?.disabled && (
            <Sidebar
                open={open()}
                options={props.options}
                onOptionsChange={props.onOptionChange}
            />
        )}
    </>)
}

export {
    ConnectionManager as Connection,
    connection
}