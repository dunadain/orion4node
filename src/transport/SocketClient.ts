import { ErrorCode } from '../config/ErrorCode';
import { MsgType } from './protocol/MsgProcessor';

export interface SocketClient<T> {
    id: number;
    uid: string;
    rid: number;
    /**
     * native socket
     */
    socket: T;
    state: ClientState;
    sendMsg(type: MsgType, route: number, msg: unknown, reqId?: number): void;
    sendBuffer(buffer: Buffer): void;
    reportError(code: ErrorCode, msg?: string): void;
    onMessage(msg: ArrayBuffer): void;
    onDrain?(): void;
    disconnect(): void;
    dispose(): void;
    init(): void;
}

export enum ClientState {
    Default,
    WaitForAck,
    Ready,
    Closed,
}
