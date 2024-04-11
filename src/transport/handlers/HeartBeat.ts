import { netConfig } from '../../config/NetConfig';
import { logger } from '../../logger/Logger';
import { SocketClient } from '../SocketClient';
import { PackType, encode } from '../protocol/Package';
import { PkgHandler } from './PkgHandler';

export class HeartBeat implements PkgHandler {
    private timeout: NodeJS.Timeout;
    constructor(private client: SocketClient<unknown>) {
        // if the handshake isn't finished in netConfig.hearbeatTimeout * 2 miliseconds, consider the client is unreachable
        this.timeout = setTimeout(this.timoutAction, netConfig.hearbeatTimeout * 2);
    }

    handle() {
        this.client.sendBuffer(encode(PackType.HEARTBEAT));
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.timoutAction, netConfig.hearbeatTimeout);
    }

    private timoutAction = () => {
        logger.info(`client [${this.client.uuidForUser}/${this.client.id.toString()}] heartbeat timeout.`);
        this.client.disconnect();
    };

    dispose() {
        clearTimeout(this.timeout);
    }
}