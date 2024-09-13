/// <reference types="node" resolution-mode="require"/>
import { ErrorCode } from '../config/ErrorCode.mjs';
import { MsgType } from './protocol/MsgProcessor.mjs';
export interface SocketClient<T> {
    id: number;
    uid: string;
    roleid: string;
    /**
     * native socket
     */
    socket: T;
    state: ClientState;
    sendMsg(type: MsgType, route: number, msg: Buffer | undefined, reqId?: number): void;
    sendBuffer(buffer: Buffer): void;
    reportError(code: ErrorCode, msg?: string): void;
    onMessage(msg: ArrayBuffer): void;
    onDrain?(): void;
    disconnect(): void;
    dispose(): void;
    init(): void;
}
export declare enum ClientState {
    Default = 0,
    WaitForAck = 1,
    Ready = 2,
    Closed = 3
}
