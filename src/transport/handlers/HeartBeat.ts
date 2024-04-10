import { netConfig } from '../../config/NetConfig';
import { logger } from '../../logger/Logger';
import { SocketClient } from '../SocketClient';
import { PackType, encode } from '../protocol/Package';
import { PkgHandler } from './PkgHandler';

export class HeartBeat implements PkgHandler {
    private timeout: NodeJS.Timeout | undefined;
    constructor(private client: SocketClient<unknown>) {
    }

    handle() {
        this.client.sendBuffer(encode(PackType.TYPE_HEARTBEAT));
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(this.timoutAction, netConfig.hearbeatTimeout);
    }

    private timoutAction = () => {
        logger.info('client %j heartbeat timeout.', this.client.uuidForUser);
        this.client.disconnect();
    };

    dispose() {
        clearTimeout(this.timeout);
        this.timeout = undefined;
    }
}