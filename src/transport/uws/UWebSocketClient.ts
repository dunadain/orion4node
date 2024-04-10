import { WebSocket } from 'uWebSockets.js';
import { ClientState, SocketClient } from '../SocketClient';
import * as packUtils from '../protocol/Package';
import { PkgHandler } from '../handlers/PkgHandler';
import { logger } from '../../logger/Logger';
import { HeartBeat } from '../handlers/HeartBeat';
import { HandShake } from '../handlers/HandShake';
import { HandShakeAck } from '../handlers/HandShakeAck';
import { DataHandler } from '../handlers/DataHandler';
import { ErrorCode } from '../../config/ErrorCode';

export class UWebSocketClient implements SocketClient<WebSocket<unknown>> {
    id = 0;
    uuidForUser = '';

    socket!: WebSocket<unknown>;

    state = ClientState.Default;

    private buffer: ArrayBuffer[] = [];
    private helperArr: { type: packUtils.PackType, body: Buffer | undefined }[] = [];
    private handlers = new Map<packUtils.PackType, PkgHandler>();

    init(): void {
        this.handlers.set(packUtils.PackType.HANDSHAKE, new HandShake(this));
        this.handlers.set(packUtils.PackType.HANDSHAKE_ACK, new HandShakeAck(this));
        this.handlers.set(packUtils.PackType.HEARTBEAT, new HeartBeat(this));
        this.handlers.set(packUtils.PackType.DATA, new DataHandler(this));
    }

    send<T>(msg: T) {
        if (ClientState.Ready !== this.state) return;
    }

    onMessage(dataRcv: ArrayBuffer) {
        packUtils.decode(Buffer.from(dataRcv), this.helperArr);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.helperArr.length; ++i) {
            const pack = this.helperArr[i];
            if (!this.handlers.has(pack.type)) {
                logger.error(`invalid package type: ${pack.type.toString()}`);
                this.disconnect();
                return;
            }
            this.handlers.get(pack.type)?.handle(pack.body);
        }
        this.helperArr.length = 0;
    }

    onDrain() {
        this.flush();
    }

    sendBuffer(buffer: Buffer) {
        this.buffer.push(buffer);
        this.flush();
    }

    disconnect(): void {
        this.socket.end(0);
    }

    dispose(): void {
        this.handlers.forEach(handler => {
            handler.dispose?.call(handler);
        });
        this.handlers.clear();
    }

    private flush() {
        const len = this.buffer.length;
        if (len === 0) return;
        let i = 0;
        for (; i < len; ++i) {
            const msg = this.buffer[i];
            const state = this.socket.send(msg);
            if (state === 2) {
                break;
            }
        }
        if (i > 0) {
            if (i === len) this.buffer.length = 0;
            else this.buffer.splice(0, i);
        }
    }
}