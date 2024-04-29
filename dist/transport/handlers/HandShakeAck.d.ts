import { SocketClient } from '../SocketClient';
import { PkgHandler } from './PacketHandler';
export declare class HandShakeAck implements PkgHandler {
    private client;
    constructor(client: SocketClient<unknown>);
    handle(): void;
}
