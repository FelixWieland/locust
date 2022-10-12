import { apiClient } from "./api/api.client";
import { Heartbeat, Session, StreamRequest, StreamResponse, UnaryStreamRequest, CreateNode, Node, UpdateNodeValue, NodeValue, None, StreamResponses, StreamRequests } from "./api/messages";
import { Options, UUID } from "./types";
import { NodeValue as NodeValueC } from "./node_value";
import * as heartbeat from './time'
import { readSessionToken, setLatency, setLastServerResponseTime, setSession, updateNodes, writeSessionToken } from "./store";
import { assure } from "./util";
import { produce } from "solid-js/store";
import { Any } from "./api/google/protobuf/any";
import { Batcher } from "./batcher";

class Connection {
    private _server: apiClient;

    private _id: UUID

    private _lastHeartbeat: null | Heartbeat;

    private _latencyMs: null | number

    private _options: Options

    private _requestBatcher: Batcher<StreamRequests, Promise<void>>;

    private _STOP = false

    constructor(connectionID: UUID, apiServer: apiClient, options: Options) {
        this._id = connectionID
        this._server = apiServer
        this._options = options

        this._requestBatcher = new Batcher(
            this.combineStreamRequestsAndSend.bind(this), 
            options.requestBatchMs, 
            options.requestDebounceMs
        )

        this.beatOnce()
    }

    public id(): UUID {
        return this._id;
    }

    public heartIsBeating(): boolean {
        return false
    }

    public async beatOnce() {
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
        this.sendSingle(sr, true).finally(() => {
            setTimeout(() => this.beatOnce(), 10000)
        })
    }

    private async combineStreamRequestsAndSend(requests: Array<StreamRequests>) {
        if (this._STOP) {
            return
        }
        try {
            const sr = UnaryStreamRequest.create()
            sr.connectionID = this._id
            sr.requests = requests.flatMap(r => r.requests)
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

    private async sendMulti(requests: Array<StreamRequest>, unbatched=false) {
        const sr = UnaryStreamRequest.create()
        sr.connectionID = this._id
        sr.requests = requests
        if (unbatched) {
            this.combineStreamRequestsAndSend([sr])
        } else {
            this._requestBatcher.push(sr)
        }
    }

    private async sendSingle(sr: StreamRequest, unbatched=false) {
        await this.sendMulti([sr], unbatched)
    }

    public async createNode(nv?: NodeValue) {
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
        await this.sendSingle(sr)
    }

    public async updateNodeValue(nodeID: string, data: Any) {
        const sr = StreamRequest.create()
        const up = UpdateNodeValue.create()
        up.id = nodeID
        up.data = data
        sr.data = {
            oneofKind: "updateNodeValue",
            updateNodeValue: up
        }
        await this.sendSingle(sr)
    }

    public async subscribeToNode(nodeID: string) {
        const sr = StreamRequest.create()
        sr.data = {
            oneofKind: "subscribeToNode",
            subscribeToNode: {
                id: nodeID
            }
        }
        await this.sendSingle(sr)
    }

    public async unsubscribeFromNode(nodeID: string, drop: boolean = true) {
        const sr = StreamRequest.create()
        sr.data = {
            oneofKind: "unsubscribeFromNode",
            unsubscribeFromNode: {
                id: nodeID
            }
        }
        await this.sendSingle(sr)
        if (drop) {
            this.dropNodeState(nodeID)
        }
    }

    public onResponses(message: StreamResponses) {
        setLastServerResponseTime(new Date())
        message.responses.forEach(response => this.onResponse(response))
    }

    private onResponse(response: StreamResponse) {
        if (assure(response, "heartbeat")) {
            this.onHeartbeat((response.data as unknown as any).heartbeat as Heartbeat)
        } else if (assure(response, "session")) {
            this.onSession((response.data as unknown as any).session as Session)
        } else if (assure(response, "node")) {
            this.onNode((response.data as unknown as any).node as Node)
        } else if (assure(response, "connection")) {

        }
    }

    private dropNodeState(nodeID: string) {
        updateNodes(produce(nodes => {
            delete nodes[nodeID]
        }))
    }

    private onHeartbeat(data: Heartbeat) {
        if (!this._lastHeartbeat || !this._lastHeartbeat.timestamp || !data.timestamp) {
            return
        }
        this._latencyMs = heartbeat.calculateLatencyMs(this._lastHeartbeat.timestamp, data.timestamp)
        setLatency(this._latencyMs)
        console.log(`Connection.Heartbeat: received server : ${data.timestamp.seconds}, latency: ${this._latencyMs}ms`)
    }

    private onSession(data: Session) {
        if ((this._options.sessionToken || readSessionToken(this._options.storage)) == data.sessionToken) {
            console.log(`Session: aquired/received session`)
        } else {
            console.log(`Session: aquired new session`)
            writeSessionToken(data.sessionToken, this._options.storage)
        }
        setSession(data)
    }

    private onNode(data: Node) {
        console.log(`Node: received node: ${data.id}`)
        updateNodes(produce(nodes => {
            const ts = (data?.value as any)?.some?.timestamp
            const _timestamp = ts ? Math.floor(new Date(Number(ts.seconds) * 1000 + (Math.floor(ts.nanos / 1000))).valueOf() / 1000) : undefined
            const _value = (data?.value as any)?.some?.data
            if (nodes[data.id]) {
                nodes[data.id]!.value().set({
                    _timestamp,
                    _value
                })
            } else {
                nodes[data.id] = {
                    id: data.id,
                    value: NodeValueC(_timestamp, _value)
                }
            }
        }))
    }

    die() {
        this._STOP = true
        setSession(null)
        setLatency(null)
    }
}

export {
    Connection
}