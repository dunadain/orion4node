import { netConfig } from '../../config/NetConfig';
import { logger } from '../../logger/Logger';
import { SocketClient } from '../SocketClient';
import { PackType, encode } from '../protocol/PacketProcessor';
import { PkgHandler } from './PacketHandler';

export class HeartBeat implements PkgHandler {
    private timeout: NodeJS.Timeout;
    constructor(private client: SocketClient<unknown>) {
        // if the handshake isn't finished in netConfig.hearbeatTimeout * 2 miliseconds, consider the client is unreachable
        this.timeout = setTimeout(this.timoutAction, netConfig.heartbeatTimeout * 2);
    }

    handle() {
        this.client.sendBuffer(encode(PackType.HEARTBEAT));
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.timoutAction, netConfig.heartbeatTimeout);
    }

    private timoutAction = () => {
        logger.info(`client [${this.client.uid}/${this.client.id.toString()}] heartbeat timeout.`);
        this.client.disconnect();
    };

    dispose() {
        clearTimeout(this.timeout);
    }
}
