import { type SocketClient } from '../SocketClient.mjs';
import type { PkgHandler } from './PacketHandler.mjs';
export declare class HandShakeAck implements PkgHandler {
    private client;
    constructor(client: SocketClient<unknown>);
    handle(): void;
}
