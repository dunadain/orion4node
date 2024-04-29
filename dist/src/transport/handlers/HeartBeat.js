"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartBeat = void 0;
const NetConfig_1 = require("../../config/NetConfig");
const Logger_1 = require("../../logger/Logger");
const PacketProcessor_1 = require("../protocol/PacketProcessor");
class HeartBeat {
    client;
    timeout;
    constructor(client) {
        this.client = client;
        // if the handshake isn't finished in netConfig.hearbeatTimeout * 2 miliseconds, consider the client is unreachable
        this.timeout = setTimeout(this.timoutAction, NetConfig_1.netConfig.heartbeatTimeout * 2);
    }
    handle() {
        this.client.sendBuffer((0, PacketProcessor_1.encode)(PacketProcessor_1.PackType.HEARTBEAT));
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.timoutAction, NetConfig_1.netConfig.heartbeatTimeout);
    }
    timoutAction = () => {
        Logger_1.logger.info(`client [${this.client.uid}/${this.client.id.toString()}] heartbeat timeout.`);
        this.client.disconnect();
    };
    dispose() {
        clearTimeout(this.timeout);
    }
}
exports.HeartBeat = HeartBeat;
