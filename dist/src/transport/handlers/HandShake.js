"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandShake = void 0;
const ErrorCode_1 = require("../../config/ErrorCode");
const NetConfig_1 = require("../../config/NetConfig");
const Logger_1 = require("../../logger/Logger");
const SocketClient_1 = require("../SocketClient");
const PacketProcessor_1 = require("../protocol/PacketProcessor");
class HandShake {
    client;
    constructor(client) {
        this.client = client;
    }
    handle(msg) {
        if (SocketClient_1.ClientState.Default !== this.client.state)
            return;
        let data;
        try {
            data = JSON.parse(msg.toString());
        }
        catch (e) {
            this.processError(ErrorCode_1.ErrorCode.InvaildHandShakeInfo, 'What went wrong:handshake info json parse');
            Logger_1.logger.error(`handshake info json parse error. received msg was ${msg.toString()}`);
            return;
        }
        if (!data.sys) {
            this.processError(ErrorCode_1.ErrorCode.InvaildHandShakeInfo, 'Handshake info is insufficient.');
            return;
        }
        if (typeof this.checkClient === 'function') {
            if (!data.sys.ver || !this.checkClient(data.sys.ver)) {
                this.processError(ErrorCode_1.ErrorCode.OutdatedClient, 'The client is outdated');
                return;
            }
        }
        const sysRsp = {
            heartbeat: NetConfig_1.netConfig.heartbeatInterval,
        };
        const res = {
            sys: sysRsp,
        };
        this.client.sendBuffer((0, PacketProcessor_1.encode)(PacketProcessor_1.PackType.HANDSHAKE, Buffer.from(JSON.stringify(res))));
        this.client.state = SocketClient_1.ClientState.WaitForAck;
    }
    processError(errCode, msg) {
        this.client.reportError(errCode, msg);
        this.client.disconnect();
    }
}
exports.HandShake = HandShake;
