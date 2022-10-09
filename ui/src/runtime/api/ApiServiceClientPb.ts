/**
 * @fileoverview gRPC-Web generated client stub for api
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as messages_pb from './messages_pb';


export class apiClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: any; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoStream = new grpcWeb.MethodDescriptor(
    '/api.api/Stream',
    grpcWeb.MethodType.SERVER_STREAMING,
    messages_pb.StreamRequests,
    messages_pb.StreamResponses,
    (request: messages_pb.StreamRequests) => {
      return request.serializeBinary();
    },
    messages_pb.StreamResponses.deserializeBinary
  );

  stream(
    request: messages_pb.StreamRequests,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/api.api/Stream',
      request,
      metadata || {},
      this.methodInfoStream);
  }

  methodInfoStreamRequest = new grpcWeb.MethodDescriptor(
    '/api.api/StreamRequest',
    grpcWeb.MethodType.UNARY,
    messages_pb.UnaryStreamRequest,
    messages_pb.None,
    (request: messages_pb.UnaryStreamRequest) => {
      return request.serializeBinary();
    },
    messages_pb.None.deserializeBinary
  );

  streamRequest(
    request: messages_pb.UnaryStreamRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.None>;

  streamRequest(
    request: messages_pb.UnaryStreamRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: messages_pb.None) => void): grpcWeb.ClientReadableStream<messages_pb.None>;

  streamRequest(
    request: messages_pb.UnaryStreamRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: messages_pb.None) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/api.api/StreamRequest',
        request,
        metadata || {},
        this.methodInfoStreamRequest,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/api.api/StreamRequest',
    request,
    metadata || {},
    this.methodInfoStreamRequest);
  }

}

