import { MessageEvent, WebSocket } from 'ws';
export declare function createConnection(port: number, obj?: any): Promise<WebSocket>;
export declare function decodeClientData(e: MessageEvent): {
    id: number;
    route: number;
    body: any;
} | undefined;
