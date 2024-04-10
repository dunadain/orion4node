import { ErrorCode } from '../../config/ErrorCode';
import { ClientState, SocketClient } from '../SocketClient';
import { PackType, encode } from '../protocol/Package';
import { PkgHandler } from './PkgHandler';

export class HandShake implements PkgHandler {
    constructor(private client: SocketClient<unknown>) { }
    checkClient?: ((ver: string) => boolean) | undefined;
    handle(msg: Buffer): void {
        if (ClientState.Default !== this.client.state) return;
        const data = JSON.parse(msg.toString()) as { sys: { ver: string }, user: unknown };

    }

    private notifyError(errCode: ErrorCode) {
        const res = {
            code: errCode
        };
        this.client.sendBuffer(encode(PackType.HANDSHAKE, Buffer.from(JSON.stringify(res))));
        this.client.disconnect();
    }
}