import { ClientState, type SocketClient } from '../SocketClient.mjs';
import type { PkgHandler } from './PacketHandler.mjs';

export class HandShakeAck implements PkgHandler {
    constructor(private client: SocketClient<unknown>) {}
    handle(): void {
        if (ClientState.WaitForAck !== this.client.state) return;
        this.client.state = ClientState.Ready;
    }
}
