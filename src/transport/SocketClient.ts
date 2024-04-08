export interface SocketClient<T> {
    id: number;
    uuidForUser: string;
    socket: T;
    send<T>(msg: T): void;
    onMessage(msg: ArrayBuffer): void;
    onDrain?(): void;
}