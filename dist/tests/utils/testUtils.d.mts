/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { WebSocket } from 'ws';
import * as net from 'net';
export declare function createConnection(port: number, obj?: any): Promise<WebSocket>;
export declare function decodeClientData(e: Buffer): {
    id: number;
    route: number;
    body: any;
} | undefined;
export declare function createTcpConnection(port: number, host: string, clientVersion?: number): Promise<net.Socket>;
