import { apiClient } from "./api/api.client";
import { Heartbeat, Session, StreamRequest, StreamResponse, UnaryStreamRequest, CreateNode, Node, UpdateNodeValue, NodeValue, None } from "./api/messages";
import { ConnectionOptions, NodeValue as NodeValueC, UUID } from "./types";
import * as heartbeat from './heartbeat'
import { readSessionToken, setLatency, setSession, updateNodes, writeSessionToken } from "./store";
import { assure } from "./util";
import { produce } from "solid-js/store";


class Connection {
    private _server: apiClient;

    private _id: UUID

    private _lastHeartbeat: null | Heartbeat;

    private _latencyMs: null | number

    private _options: ConnectionOptions

    private _STOP = false

    constructor(connectionID: UUID, apiServer: apiClient, options: ConnectionOptions) {
        this._id = connectionID
        this._server = apiServer
        this._options = options

        // start heart beat
        this.beatOnce()
    }

    id(): UUID {
        return this._id;
    }

    heartIsBeating(): boolean {
        return false
    }

    async beatOnce() {
        if (this._STOP) {
            return
        }
        this._lastHeartbeat = Heartbeat.create()
        this._lastHeartbeat.timestamp = heartbeat.currentTimestamp()
        const sr = StreamRequest.create()
        sr.data = {
            oneofKind: "heartbeat",
            heartbeat: this._lastHeartbeat,
        }
        this.sendSingleData(sr).finally(() => {
            setTimeout(() => this.beatOnce(), 10000)
        })
    }

    async send(requests: Array<StreamRequest>) {
        try {
            const sr = UnaryStreamRequest.create()
            sr.connectionID = this._id
            sr.requests.push(...requests)
            const r = this._server.streamRequest(sr)
            await r.response
        } catch (ex) {
            if (`${ex}`.includes("Connection%20not%20found")) {
                // here the connection object needs to die or at least stop
                this._STOP = true
            }
            throw ex
        }
    }

    async createNode(nv?: NodeValue) {
        const sr = StreamRequest.create()
        sr.data = {
            oneofKind: "createNode",
            createNode: {
                value: nv ? {
                    oneofKind: 'some',
                    some: nv
                } : {
                    oneofKind: 'none',
                    none: None.create()
                }
            }
        }
        await this.sendSingleData(sr)
    }

    async updateNodeValue(up: UpdateNodeValue) {
        const sr = StreamRequest.create()
        sr.data = {
            oneofKind: "updateNodeValue",
            updateNodeValue: up
        }
        await this.sendSingleData(sr)
    }

    async sendSingleData(sr: StreamRequest) {
        await this.send([sr])
    }

    onResponse(response: StreamResponse) {
        if (assure(response, "heartbeat")) {
            this.onHeartbeat((response.data as unknown as any).heartbeat as Heartbeat)
        } else if (assure(response, "session")) {
            this.onSession((response.data as unknown as any).session as Session)
        } else if (assure(response, "node")) {
            this.onNode((response.data as unknown as any).node as Node)
        } else if (assure(response, "connection")) {

        }
    }

    private onHeartbeat(data: Heartbeat) {
        if (this._lastHeartbeat == null) {
            return
        }
        this._latencyMs = heartbeat.calculateLatencyMs(this._lastHeartbeat.timestamp, data.timestamp)
        setLatency(this._latencyMs)
        console.log(`Connection.Heartbeat: received server : ${data.timestamp.seconds}, latency: ${this._latencyMs}ms`)
    }

    private onSession(data: Session) {
        if ((this._options.session?.token || readSessionToken(this._options.session.storage || sessionStorage)) == data.sessionToken) {
            console.log(`Session: aquired/received session`)
        } else {
            console.log(`Session: aquired new session`)
            writeSessionToken(data.sessionToken, this._options.session.storage || sessionStorage)
        }
        setSession(data)
    }

    private onNode(data: Node) {
        console.log(`Node: received node: ${data.id}`)
        updateNodes(produce(nodes => {
            if (nodes[data.id]) {
                // we already have the node so we just update the value
                nodes[data.id].value = new NodeValueC((data?.value as any)?.some?.timestamp, (data?.value as any)?.some?.data)
            } else {
                nodes[data.id] = {
                    id: data.id,
                    value: new NodeValueC((data?.value as any)?.some?.timestamp, (data?.value as any)?.some?.data)
                }
            }
        }))
    }

    die() {
        this._STOP = true
    }
}

export {
    Connection
}