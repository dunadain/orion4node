import { RecognizedString } from 'uWebSockets.js';

export interface WsClient {
    uuidForUser: string;
    socket: unknown;
    send(msg: RecognizedString): void;
}