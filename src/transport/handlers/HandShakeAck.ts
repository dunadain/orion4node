import { ClientState, SocketClient } from '../SocketClient';
import { PackType, encode } from '../protocol/PacketProcessor';
import { PkgHandler } from './PacketHandler';

export class HandShakeAck implements PkgHandler {
    constructor(private client: SocketClient<unknown>) {}
    handle(): void {
        if (ClientState.WaitForAck !== this.client.state) return;
        this.client.state = ClientState.Ready;
        this.client.sendBuffer(encode(PackType.HANDSHAKE_ACK));
    }
}
