import { type SocketClient } from '../SocketClient.mjs';
import type { PkgHandler } from './PacketHandler.mjs';
declare module './HandShake.mjs' {
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
