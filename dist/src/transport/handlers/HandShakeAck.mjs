import { ClientState } from '../SocketClient.mjs';
export class HandShakeAck {
    client;
    constructor(client) {
        this.client = client;
    }
    handle() {
        if (ClientState.WaitForAck !== this.client.state)
            return;
        this.client.state = ClientState.Ready;
    }
}
