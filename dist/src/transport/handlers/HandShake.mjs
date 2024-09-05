import { ErrorCode } from '../../config/ErrorCode.mjs';
import { netConfig } from '../../config/NetConfig.mjs';
import { logger } from '../../logger/Logger.mjs';
import { ClientState } from '../SocketClient.mjs';
import { PackType, encode } from '../protocol/PacketProcessor.mjs';
export class HandShake {
    client;
    constructor(client) {
        this.client = client;
    }
    handle(msg) {
        if (ClientState.Default !== this.client.state)
            return;
        let data;
        try {
            data = JSON.parse(msg.toString());
        }
        catch (e) {
            this.processError(ErrorCode.InvaildHandShakeInfo, 'What went wrong:handshake info json parse');
            logger.error(`handshake info json parse error. received msg was ${msg.toString()}`);
            return;
        }
        if (!data.sys) {
            this.processError(ErrorCode.InvaildHandShakeInfo, 'Handshake info is insufficient.');
            return;
        }
        if (typeof this.checkClient === 'function') {
            if (!data.sys.ver || !this.checkClient(data.sys.ver)) {
                this.processError(ErrorCode.OutdatedClient, 'The client is outdated');
                return;
            }
        }
        const sysRsp = {
            heartbeat: netConfig.heartbeatInterval,
        };
        const res = {
            sys: sysRsp,
        };
        this.client.sendBuffer(encode(PackType.HANDSHAKE, Buffer.from(JSON.stringify(res))));
        this.client.state = ClientState.WaitForAck;
    }
    processError(errCode, msg) {
        this.client.reportError(errCode, msg);
        this.client.disconnect();
    }
}
