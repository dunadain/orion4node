import { SocketClient } from '../SocketClient';
import { PkgHandler } from './PacketHandler';
export declare class HeartBeat implements PkgHandler {
    private client;
    private timeout;
    constructor(client: SocketClient<unknown>);
    handle(): void;
    private timoutAction;
    dispose(): void;
}
