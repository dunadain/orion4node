import type { SocketClient } from '../SocketClient.mjs';
import type { PkgHandler } from './PacketHandler.mjs';
export declare class HeartBeat implements PkgHandler {
    private client;
    private timeout;
    constructor(client: SocketClient<unknown>);
    handle(): void;
    private timoutAction;
    dispose(): void;
}
