import { ErrorCode } from '../../config/ErrorCode.mjs';
import { netConfig } from '../../config/NetConfig.mjs';
import { logger } from '../../logger/Logger.mjs';
import { ClientState, type SocketClient } from '../SocketClient.mjs';
import { PackType, encode } from '../protocol/PacketProcessor.mjs';
import type { PkgHandler } from './PacketHandler.mjs';
interface HandShakeInfo {
    sys: { ver: string; protoVer?: number } | undefined;
    user: unknown;
}
declare module './HandShake.mjs' {
    interface HandShake {
        checkClient?: (ver: string) => boolean; // can be injected through prototype
    }
}
export class HandShake implements PkgHandler {
    constructor(private client: SocketClient<unknown>) {}
    handle(msg: Buffer): void {
        if (ClientState.Default !== this.client.state) return;

        let data: HandShakeInfo;
        try {
            data = JSON.parse(msg.toString()) as HandShakeInfo;
        } catch (e) {
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

    private processError(errCode: ErrorCode, msg: string) {
        this.client.reportError(errCode, msg);
        this.client.disconnect();
    }
}
