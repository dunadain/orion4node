import { ErrorCode } from '../config/ErrorCode';
import { MsgType } from './protocol/Message';

export interface SocketClient<T> {
    id: number;
    uuidForUser: string;
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
