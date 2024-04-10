export interface SocketClient<T> {
    id: number;
    uuidForUser: string;
    socket: T;
    send<T>(msg: T): void;
    sendBuffer(buffer: Buffer): void;
    onMessage(msg: ArrayBuffer): void;
    onDrain?(): void;
    disconnect(): void;
    dispose(): void;
    init(): void;
}