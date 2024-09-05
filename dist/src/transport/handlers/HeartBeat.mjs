import { netConfig } from '../../config/NetConfig.mjs';
import { logger } from '../../logger/Logger.mjs';
import { PackType, encode } from '../protocol/PacketProcessor.mjs';
export class HeartBeat {
    client;
    timeout;
    constructor(client) {
        this.client = client;
        // if the handshake isn't finished in netConfig.hearbeatTimeout * 2 miliseconds, consider the client is unreachable
        this.timeout = setTimeout(this.timoutAction, netConfig.heartbeatTimeout * 2);
    }
    handle() {
        this.client.sendBuffer(encode(PackType.HEARTBEAT));
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.timoutAction, netConfig.heartbeatTimeout);
    }
    timoutAction = () => {
        logger.info(`client [${this.client.uid}/${this.client.id.toString()}] heartbeat timeout.`);
        this.client.disconnect();
    };
    dispose() {
        clearTimeout(this.timeout);
    }
}
