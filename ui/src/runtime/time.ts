import { Timestamp } from "./api/google/protobuf/timestamp";

export function currentTimestamp(): Timestamp {
    const ts = Timestamp.create()
    const t = new Date()
    ts.seconds = BigInt(Math.floor(t.valueOf() / 1000))
    ts.nanos = t.getMilliseconds() * 1000
    return ts
}

export function calculateLatencyMs(client: Timestamp, server: Timestamp): number {
    let c = new Date(Number(client.seconds) * 1000 + (Math.floor(client.nanos / 1000)))
    let s = new Date(Number(server.seconds) * 1000 + (Math.floor(server.nanos / 1000)))
    return Math.floor((s.valueOf() - c.valueOf()) / 1000)
}

export function timestampFromProto(ts: Timestamp) {
    return Math.floor(new Date(Number(ts.seconds) * 1000 + (Math.floor(ts.nanos / 1000))).valueOf() / 1000)
}