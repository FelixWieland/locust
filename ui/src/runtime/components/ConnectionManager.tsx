import { createEffect, createSignal, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { apiClient } from "../api/api.client"
import { StreamRequests, Connection as ConnectionT, StreamRequest, AcquireSession, None } from '../api/messages';
import { Sidebar } from "./Sidebar"
import { Connection } from '../connection'

import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { Options, ConnectionState, UUID, PartialOptions } from "../types";
import { connection, connectionState, readSessionToken, setConnection, setConnectionState } from "../store";
import { registerShortcut } from "../shortcut";
import { defaultOptions } from "../options";

type ConnectionProps = {
    options: PartialOptions
    onOptionChange?: (newOptions: Options) => void
}

/**
 * Connection manages the connection to a locust server
 * There is only one connection allowed (per tab)
 */
function ConnectionManager(props: ConnectionProps) {
    const options = { ...props.options, ...defaultOptions } as Options

    const [open, setOpen] = createSignal(options.sidebarOpen)

    registerShortcut('b', true, () => setOpen(o => !o))

    const transport = new GrpcWebFetchTransport({
        baseUrl: props.options.endpoint
    });

    const apiServer = new apiClient(transport)

    const acquireSession = () => {
        const acquireSession = AcquireSession.create()
        const sessionToken = options.sessionToken || readSessionToken(options.storage)
        if (!sessionToken) {
            acquireSession.data = {
                oneofKind: 'none',
                none: None
            }
        } else {
            acquireSession.data = {
                oneofKind: 'sessionToken',
                sessionToken: sessionToken
            }
        }
        return acquireSession
    }

    const getInitialRequests = () => {
        const initialRequests: Array<StreamRequest> = []
        if (options.sessionAquire) {
            const sr = StreamRequest.create()
            const ar = acquireSession()
            sr.data = {
                oneofKind: 'acquireSession',
                acquireSession: ar
            }
            initialRequests.push(sr)
        }
        return initialRequests
    }

    function startConnection(options: Options) {
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
                    c = new Connection(data.id, apiServer, options)
                    setConnection(c)
                    setConnectionState(ConnectionState.CONNECTED)
                }
            })
            if (c !== null) {
                c.onResponses(message)
            }
        })
    }

    createEffect(() => {
        startConnection(options)
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
    })

    return (<>
        <span class="h-5 w-5 rounded-full shadow fixed top-3.5 left-3.5 group hover:cursor-pointer z-40" onClick={() => setOpen(o => !o)}>
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
                class="relative inline-flex rounded-full h-5 w-5 mb-0.5 opacity-90"
                classList={{
                    'bg-yellow-500': connectionState() === ConnectionState.CONNECTING,
                    'bg-teal-700': connectionState() === ConnectionState.CONNECTED,
                    'bg-red-700': connectionState() === ConnectionState.ERROR,
                }}
            />
        </span>
        {!options.sidebarDisabled && (
            <Sidebar
                open={open()}
                options={options}
                onOptionsChange={props.onOptionChange}
            />
        )}
    </>)
}

export {
    ConnectionManager as Connection,
    connection
}