import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as google_protobuf_any_pb from 'google-protobuf/google/protobuf/any_pb';


export class None extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): None.AsObject;
  static toObject(includeInstance: boolean, msg: None): None.AsObject;
  static serializeBinaryToWriter(message: None, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): None;
  static deserializeBinaryFromReader(message: None, reader: jspb.BinaryReader): None;
}

export namespace None {
  export type AsObject = {
  }
}

export class Connection extends jspb.Message {
  getId(): string;
  setId(value: string): Connection;

  getSubscribednodesidsList(): Array<string>;
  setSubscribednodesidsList(value: Array<string>): Connection;
  clearSubscribednodesidsList(): Connection;
  addSubscribednodesids(value: string, index?: number): Connection;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Connection.AsObject;
  static toObject(includeInstance: boolean, msg: Connection): Connection.AsObject;
  static serializeBinaryToWriter(message: Connection, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Connection;
  static deserializeBinaryFromReader(message: Connection, reader: jspb.BinaryReader): Connection;
}

export namespace Connection {
  export type AsObject = {
    id: string,
    subscribednodesidsList: Array<string>,
  }
}

export class Heartbeat extends jspb.Message {
  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Heartbeat;
  hasTimestamp(): boolean;
  clearTimestamp(): Heartbeat;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Heartbeat.AsObject;
  static toObject(includeInstance: boolean, msg: Heartbeat): Heartbeat.AsObject;
  static serializeBinaryToWriter(message: Heartbeat, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Heartbeat;
  static deserializeBinaryFromReader(message: Heartbeat, reader: jspb.BinaryReader): Heartbeat;
}

export namespace Heartbeat {
  export type AsObject = {
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class StreamRequests extends jspb.Message {
  getRequestsList(): Array<StreamRequest>;
  setRequestsList(value: Array<StreamRequest>): StreamRequests;
  clearRequestsList(): StreamRequests;
  addRequests(value?: StreamRequest, index?: number): StreamRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamRequests.AsObject;
  static toObject(includeInstance: boolean, msg: StreamRequests): StreamRequests.AsObject;
  static serializeBinaryToWriter(message: StreamRequests, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamRequests;
  static deserializeBinaryFromReader(message: StreamRequests, reader: jspb.BinaryReader): StreamRequests;
}

export namespace StreamRequests {
  export type AsObject = {
    requestsList: Array<StreamRequest.AsObject>,
  }
}

export class StreamResponses extends jspb.Message {
  getResponsesList(): Array<StreamResponse>;
  setResponsesList(value: Array<StreamResponse>): StreamResponses;
  clearResponsesList(): StreamResponses;
  addResponses(value?: StreamResponse, index?: number): StreamResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamResponses.AsObject;
  static toObject(includeInstance: boolean, msg: StreamResponses): StreamResponses.AsObject;
  static serializeBinaryToWriter(message: StreamResponses, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamResponses;
  static deserializeBinaryFromReader(message: StreamResponses, reader: jspb.BinaryReader): StreamResponses;
}

export namespace StreamResponses {
  export type AsObject = {
    responsesList: Array<StreamResponse.AsObject>,
  }
}

export class StreamRequest extends jspb.Message {
  getNone(): None | undefined;
  setNone(value?: None): StreamRequest;
  hasNone(): boolean;
  clearNone(): StreamRequest;

  getHeartbeat(): Heartbeat | undefined;
  setHeartbeat(value?: Heartbeat): StreamRequest;
  hasHeartbeat(): boolean;
  clearHeartbeat(): StreamRequest;

  getAcquiresession(): AcquireSession | undefined;
  setAcquiresession(value?: AcquireSession): StreamRequest;
  hasAcquiresession(): boolean;
  clearAcquiresession(): StreamRequest;

  getCreatenode(): CreateNode | undefined;
  setCreatenode(value?: CreateNode): StreamRequest;
  hasCreatenode(): boolean;
  clearCreatenode(): StreamRequest;

  getUpdatenodevalue(): UpdateNodeValue | undefined;
  setUpdatenodevalue(value?: UpdateNodeValue): StreamRequest;
  hasUpdatenodevalue(): boolean;
  clearUpdatenodevalue(): StreamRequest;

  getDataCase(): StreamRequest.DataCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamRequest): StreamRequest.AsObject;
  static serializeBinaryToWriter(message: StreamRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamRequest;
  static deserializeBinaryFromReader(message: StreamRequest, reader: jspb.BinaryReader): StreamRequest;
}

export namespace StreamRequest {
  export type AsObject = {
    none?: None.AsObject,
    heartbeat?: Heartbeat.AsObject,
    acquiresession?: AcquireSession.AsObject,
    createnode?: CreateNode.AsObject,
    updatenodevalue?: UpdateNodeValue.AsObject,
  }

  export enum DataCase { 
    DATA_NOT_SET = 0,
    NONE = 1,
    HEARTBEAT = 2,
    ACQUIRESESSION = 3,
    CREATENODE = 4,
    UPDATENODEVALUE = 5,
  }
}

export class StreamResponse extends jspb.Message {
  getNone(): None | undefined;
  setNone(value?: None): StreamResponse;
  hasNone(): boolean;
  clearNone(): StreamResponse;

  getHeartbeat(): Heartbeat | undefined;
  setHeartbeat(value?: Heartbeat): StreamResponse;
  hasHeartbeat(): boolean;
  clearHeartbeat(): StreamResponse;

  getConnection(): Connection | undefined;
  setConnection(value?: Connection): StreamResponse;
  hasConnection(): boolean;
  clearConnection(): StreamResponse;

  getSession(): Session | undefined;
  setSession(value?: Session): StreamResponse;
  hasSession(): boolean;
  clearSession(): StreamResponse;

  getNode(): Node | undefined;
  setNode(value?: Node): StreamResponse;
  hasNode(): boolean;
  clearNode(): StreamResponse;

  getDataCase(): StreamResponse.DataCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamResponse): StreamResponse.AsObject;
  static serializeBinaryToWriter(message: StreamResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamResponse;
  static deserializeBinaryFromReader(message: StreamResponse, reader: jspb.BinaryReader): StreamResponse;
}

export namespace StreamResponse {
  export type AsObject = {
    none?: None.AsObject,
    heartbeat?: Heartbeat.AsObject,
    connection?: Connection.AsObject,
    session?: Session.AsObject,
    node?: Node.AsObject,
  }

  export enum DataCase { 
    DATA_NOT_SET = 0,
    NONE = 1,
    HEARTBEAT = 2,
    CONNECTION = 3,
    SESSION = 4,
    NODE = 5,
  }
}

export class UnaryStreamRequest extends jspb.Message {
  getConnectionid(): string;
  setConnectionid(value: string): UnaryStreamRequest;

  getRequestsList(): Array<StreamRequest>;
  setRequestsList(value: Array<StreamRequest>): UnaryStreamRequest;
  clearRequestsList(): UnaryStreamRequest;
  addRequests(value?: StreamRequest, index?: number): StreamRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnaryStreamRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UnaryStreamRequest): UnaryStreamRequest.AsObject;
  static serializeBinaryToWriter(message: UnaryStreamRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnaryStreamRequest;
  static deserializeBinaryFromReader(message: UnaryStreamRequest, reader: jspb.BinaryReader): UnaryStreamRequest;
}

export namespace UnaryStreamRequest {
  export type AsObject = {
    connectionid: string,
    requestsList: Array<StreamRequest.AsObject>,
  }
}

export class AcquireSession extends jspb.Message {
  getNone(): None | undefined;
  setNone(value?: None): AcquireSession;
  hasNone(): boolean;
  clearNone(): AcquireSession;

  getSessiontoken(): string;
  setSessiontoken(value: string): AcquireSession;

  getDataCase(): AcquireSession.DataCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AcquireSession.AsObject;
  static toObject(includeInstance: boolean, msg: AcquireSession): AcquireSession.AsObject;
  static serializeBinaryToWriter(message: AcquireSession, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AcquireSession;
  static deserializeBinaryFromReader(message: AcquireSession, reader: jspb.BinaryReader): AcquireSession;
}

export namespace AcquireSession {
  export type AsObject = {
    none?: None.AsObject,
    sessiontoken: string,
  }

  export enum DataCase { 
    DATA_NOT_SET = 0,
    NONE = 1,
    SESSIONTOKEN = 2,
  }
}

export class Session extends jspb.Message {
  getSessiontoken(): string;
  setSessiontoken(value: string): Session;

  getActiveConnections(): number;
  setActiveConnections(value: number): Session;

  getSubscribednodesidsList(): Array<string>;
  setSubscribednodesidsList(value: Array<string>): Session;
  clearSubscribednodesidsList(): Session;
  addSubscribednodesids(value: string, index?: number): Session;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Session.AsObject;
  static toObject(includeInstance: boolean, msg: Session): Session.AsObject;
  static serializeBinaryToWriter(message: Session, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Session;
  static deserializeBinaryFromReader(message: Session, reader: jspb.BinaryReader): Session;
}

export namespace Session {
  export type AsObject = {
    sessiontoken: string,
    activeConnections: number,
    subscribednodesidsList: Array<string>,
  }
}

export class Node extends jspb.Message {
  getId(): string;
  setId(value: string): Node;

  getSome(): NodeValue | undefined;
  setSome(value?: NodeValue): Node;
  hasSome(): boolean;
  clearSome(): Node;

  getNone(): None | undefined;
  setNone(value?: None): Node;
  hasNone(): boolean;
  clearNone(): Node;

  getValueCase(): Node.ValueCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Node.AsObject;
  static toObject(includeInstance: boolean, msg: Node): Node.AsObject;
  static serializeBinaryToWriter(message: Node, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Node;
  static deserializeBinaryFromReader(message: Node, reader: jspb.BinaryReader): Node;
}

export namespace Node {
  export type AsObject = {
    id: string,
    some?: NodeValue.AsObject,
    none?: None.AsObject,
  }

  export enum ValueCase { 
    VALUE_NOT_SET = 0,
    SOME = 2,
    NONE = 3,
  }
}

export class NodeValue extends jspb.Message {
  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): NodeValue;
  hasTimestamp(): boolean;
  clearTimestamp(): NodeValue;

  getData(): google_protobuf_any_pb.Any | undefined;
  setData(value?: google_protobuf_any_pb.Any): NodeValue;
  hasData(): boolean;
  clearData(): NodeValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeValue.AsObject;
  static toObject(includeInstance: boolean, msg: NodeValue): NodeValue.AsObject;
  static serializeBinaryToWriter(message: NodeValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeValue;
  static deserializeBinaryFromReader(message: NodeValue, reader: jspb.BinaryReader): NodeValue;
}

export namespace NodeValue {
  export type AsObject = {
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    data?: google_protobuf_any_pb.Any.AsObject,
  }
}

export class CreateNode extends jspb.Message {
  getSome(): NodeValue | undefined;
  setSome(value?: NodeValue): CreateNode;
  hasSome(): boolean;
  clearSome(): CreateNode;

  getNone(): None | undefined;
  setNone(value?: None): CreateNode;
  hasNone(): boolean;
  clearNone(): CreateNode;

  getValueCase(): CreateNode.ValueCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateNode.AsObject;
  static toObject(includeInstance: boolean, msg: CreateNode): CreateNode.AsObject;
  static serializeBinaryToWriter(message: CreateNode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateNode;
  static deserializeBinaryFromReader(message: CreateNode, reader: jspb.BinaryReader): CreateNode;
}

export namespace CreateNode {
  export type AsObject = {
    some?: NodeValue.AsObject,
    none?: None.AsObject,
  }

  export enum ValueCase { 
    VALUE_NOT_SET = 0,
    SOME = 2,
    NONE = 3,
  }
}

export class UpdateNodeValue extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateNodeValue;

  getData(): google_protobuf_any_pb.Any | undefined;
  setData(value?: google_protobuf_any_pb.Any): UpdateNodeValue;
  hasData(): boolean;
  clearData(): UpdateNodeValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateNodeValue.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateNodeValue): UpdateNodeValue.AsObject;
  static serializeBinaryToWriter(message: UpdateNodeValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateNodeValue;
  static deserializeBinaryFromReader(message: UpdateNodeValue, reader: jspb.BinaryReader): UpdateNodeValue;
}

export namespace UpdateNodeValue {
  export type AsObject = {
    id: string,
    data?: google_protobuf_any_pb.Any.AsObject,
  }
}

