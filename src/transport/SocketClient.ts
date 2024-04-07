import { RecognizedString } from 'uWebSockets.js';

export interface SocketClient<T> {
    id: number;
    uuidForUser: string;
    socket: T;
    send(msg: RecognizedString): void;
}