/// <reference types="node" />
import { SocketClient } from '../SocketClient';
import { PkgHandler } from './PacketHandler';
declare module './HandShake' {
    interface HandShake {
        checkClient?: (ver: string) => boolean;
    }
}
export declare class HandShake implements PkgHandler {
    private client;
    constructor(client: SocketClient<unknown>);
    handle(msg: Buffer): void;
    private processError;
}
