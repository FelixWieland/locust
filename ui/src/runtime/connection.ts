import { apiClient } from "./api/api.client";
import { ConnectionID, Heartbeat, StreamRequest, StreamResponse, UnaryStreamRequest } from "./api/messages";
import { UUID } from "./types";
import * as heartbeat from './heartbeat'


class Connection {
    private _server: apiClient;

    private _id: UUID
    
    private _lastHeartbeat: null | Heartbeat
    private _latencyMs: null | number

    private _STOP = false

    constructor(connectionID: UUID, apiServer: apiClient) {
        this._id = connectionID
        this._server = apiServer

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
            sr.connectionID = ConnectionID.create()
            sr.connectionID.id = this._id
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

    async sendSingleData(sr: StreamRequest) {
        await this.send([sr])
    }

    onResponse(response: StreamResponse) {
        switch (response.data.oneofKind) {
        case "heartbeat": this.onHeartbeat((response.data as unknown as any).heartbeat as Heartbeat)
        default: break
        }
    }

    private onHeartbeat(data: Heartbeat) {
        if (this._lastHeartbeat == null) {
            return
        }
        this._latencyMs = heartbeat.calculateLatencyMs(this._lastHeartbeat.timestamp, data.timestamp)
        console.log(`Connection.Heartbeat: received server : ${data.timestamp.seconds}, latency: ${this._latencyMs}ms`)
    }

    die() {
        this._STOP = true
    }
}

export {
    Connection
}