export interface SocketClient<T> {
    id: number;
    uuidForUser: string;
    socket: T;
    state: ClientState;
    send<T>(msg: T): void;
    sendBuffer(buffer: Buffer): void;
    onMessage(msg: ArrayBuffer): void;
    onDrain?(): void;
    disconnect(): void;
    dispose(): void;
    init(): void;
}

export enum ClientState {
    Default,
    WaitForAck,
    Ready
}