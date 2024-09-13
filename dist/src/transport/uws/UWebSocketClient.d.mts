/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import type { WebSocket } from 'uWebSockets.js';
import { ClientState, type SocketClient } from '../SocketClient.mjs';
import * as msgUtils from '../protocol/MsgProcessor.mjs';
import { ErrorCode } from '../../config/ErrorCode.mjs';
import { EventEmitter } from 'node:events';
export declare class UWebSocketClient implements SocketClient<WebSocket<unknown>> {
    readonly serverEventEmitter: EventEmitter;
    id: number;
    uid: string;
    roleid: string;
    socket: WebSocket<unknown>;
    state: ClientState;
    private buffer;
    private helperArr;
    private handlers;
    constructor(serverEventEmitter: EventEmitter);
    init(): void;
    reportError(code: ErrorCode, msg?: string): void;
    sendMsg(type: msgUtils.MsgType, route: number, msg: Buffer | undefined, reqId?: number): void;
    onMessage(dataRcv: ArrayBuffer): void;
    onDrain(): void;
    sendBuffer(buffer: Buffer): void;
    disconnect(): void;
    dispose(): void;
    private flush;
}
