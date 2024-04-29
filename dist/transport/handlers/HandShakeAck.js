"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandShakeAck = void 0;
const SocketClient_1 = require("../SocketClient");
const PacketProcessor_1 = require("../protocol/PacketProcessor");
class HandShakeAck {
    client;
    constructor(client) {
        this.client = client;
    }
    handle() {
        if (SocketClient_1.ClientState.WaitForAck !== this.client.state)
            return;
        this.client.state = SocketClient_1.ClientState.Ready;
        this.client.sendBuffer((0, PacketProcessor_1.encode)(PacketProcessor_1.PackType.HANDSHAKE_ACK));
    }
}
exports.HandShakeAck = HandShakeAck;
