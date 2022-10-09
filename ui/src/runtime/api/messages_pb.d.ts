import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';


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

export class ConnectionID extends jspb.Message {
  getId(): string;
  setId(value: string): ConnectionID;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectionID.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectionID): ConnectionID.AsObject;
  static serializeBinaryToWriter(message: ConnectionID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectionID;
  static deserializeBinaryFromReader(message: ConnectionID, reader: jspb.BinaryReader): ConnectionID;
}

export namespace ConnectionID {
  export type AsObject = {
    id: string,
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
  }

  export enum DataCase { 
    DATA_NOT_SET = 0,
    NONE = 1,
    HEARTBEAT = 2,
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

  getConnectionid(): ConnectionID | undefined;
  setConnectionid(value?: ConnectionID): StreamResponse;
  hasConnectionid(): boolean;
  clearConnectionid(): StreamResponse;

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
    connectionid?: ConnectionID.AsObject,
  }

  export enum DataCase { 
    DATA_NOT_SET = 0,
    NONE = 1,
    HEARTBEAT = 2,
    CONNECTIONID = 3,
  }
}

export class UnaryStreamRequest extends jspb.Message {
  getConnectionid(): ConnectionID | undefined;
  setConnectionid(value?: ConnectionID): UnaryStreamRequest;
  hasConnectionid(): boolean;
  clearConnectionid(): UnaryStreamRequest;

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
    connectionid?: ConnectionID.AsObject,
    requestsList: Array<StreamRequest.AsObject>,
  }
}

