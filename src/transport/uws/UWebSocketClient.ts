import { WebSocket } from 'uWebSockets.js';
import { ClientState, SocketClient } from '../SocketClient';
import * as packUtils from '../protocol/Package';
import * as msgUtils from '../protocol/Message';
import { PkgHandler } from '../handlers/PkgHandler';
import { logErr, logger } from '../../logger/Logger';
import { HeartBeat } from '../handlers/HeartBeat';
import { HandShake } from '../handlers/HandShake';
import { HandShakeAck } from '../handlers/HandShakeAck';
import { ErrorCode } from '../../config/ErrorCode';
import { EventEmitter } from 'node:events';

export class UWebSocketClient implements SocketClient<WebSocket<unknown>> {
    id = 0;
    uuidForUser = '';

    socket!: WebSocket<unknown>;

    state = ClientState.Default;

    private bodyDecoder: (body: Buffer, route?: number) => unknown = (body: Buffer) =>
        JSON.parse(body.toString('utf8'));
    private bodyEncoder: (data: unknown, route?: number) => Buffer = (data: unknown) => {
        return Buffer.from(JSON.stringify(data), 'utf8');
    };
    private buffer: ArrayBuffer[] = [];
    private helperArr: { type: packUtils.PackType; body: Buffer | undefined }[] = [];
    private handlers = new Map<packUtils.PackType, PkgHandler>();

    constructor(readonly parentEventEmitter: EventEmitter) {}

    init(): void {
        this.handlers.set(packUtils.PackType.HANDSHAKE, new HandShake(this));
        this.handlers.set(packUtils.PackType.HANDSHAKE_ACK, new HandShakeAck(this));
        this.handlers.set(packUtils.PackType.HEARTBEAT, new HeartBeat(this));
        this.handlers.set(packUtils.PackType.DATA, {
            handle: (msg: Buffer) => {
                const decodedData = msgUtils.decode(msg);
                this.parentEventEmitter.emit('message', {
                    id: decodedData.id,
                    type: decodedData.type,
                    route: decodedData.route,
                    body: this.bodyDecoder(decodedData.body, decodedData.route),
                });
            },
        });
    }

    reportError(code: ErrorCode, msg?: string): void {
        const errobj = {
            code,
            msg,
        };
        this.sendBuffer(packUtils.encode(packUtils.PackType.ERROR, Buffer.from(JSON.stringify(errobj))));
    }

    sendMsg(type: msgUtils.MsgType, route: number, msg: unknown, reqId = 0): void {
        if (ClientState.Ready !== this.state) return;
        const encodedBody = this.bodyEncoder(msg, route);
        const msgBody = msgUtils.encode(reqId, type, route, encodedBody, false);
        this.sendBuffer(packUtils.encode(packUtils.PackType.DATA, msgBody));
    }

    onMessage(dataRcv: ArrayBuffer) {
        try {
            packUtils.decode(Buffer.from(dataRcv), this.helperArr);
        } catch (e) {
            logErr(e);
            this.disconnect();
            return;
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.helperArr.length; ++i) {
            if (this.state === ClientState.Closed) return;

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
        this.state = ClientState.Closed;
    }

    dispose(): void {
        this.handlers.forEach((handler) => {
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
            const state = this.socket.send(msg, true);
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
