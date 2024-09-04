import { ErrorCode } from '../config/ErrorCode.mjs';
import { MsgType } from './protocol/MsgProcessor.mjs';

export interface SocketClient<T> {
    id: number;
    uid: string;
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

export enum ClientState {
    Default,
    WaitForAck,
    Ready,
    Closed,
}
