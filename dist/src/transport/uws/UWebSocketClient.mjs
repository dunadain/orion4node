import { ClientState } from '../SocketClient.mjs';
import * as packUtils from '../protocol/PacketProcessor.mjs';
import * as msgUtils from '../protocol/MsgProcessor.mjs';
import { HeartBeat } from '../handlers/HeartBeat.mjs';
import { HandShake } from '../handlers/HandShake.mjs';
import { HandShakeAck } from '../handlers/HandShakeAck.mjs';
import { ErrorCode } from '../../config/ErrorCode.mjs';
import { EventEmitter } from 'node:events';
export class UWebSocketClient {
    serverEventEmitter;
    id = 0;
    uid = '';
    socket;
    state = ClientState.Default;
    buffer = [];
    helperArr = [];
    handlers = new Map();
    constructor(serverEventEmitter) {
        this.serverEventEmitter = serverEventEmitter;
    }
    init() {
        this.handlers.set(packUtils.PackType.HANDSHAKE, new HandShake(this));
        this.handlers.set(packUtils.PackType.HANDSHAKE_ACK, new HandShakeAck(this));
        this.handlers.set(packUtils.PackType.HEARTBEAT, new HeartBeat(this));
        this.handlers.set(packUtils.PackType.DATA, {
            handle: (msg) => {
                const decodedData = msgUtils.decode(msg);
                this.serverEventEmitter.emit('message', {
                    msg: {
                        id: decodedData.id,
                        type: decodedData.type,
                        protoId: decodedData.route,
                        body: decodedData.body,
                    },
                    client: this,
                });
            },
        });
    }
    reportError(code, msg) {
        const errobj = {
            code,
            msg,
        };
        this.sendBuffer(packUtils.encode(packUtils.PackType.ERROR, Buffer.from(JSON.stringify(errobj))));
    }
    sendMsg(type, route, msg, reqId = 0) {
        if (ClientState.Ready !== this.state)
            return;
        const msgBody = msgUtils.encode(reqId, type, route, msg);
        this.sendBuffer(packUtils.encode(packUtils.PackType.DATA, msgBody));
    }
    onMessage(dataRcv) {
        this.helperArr.length = 0;
        packUtils.decode(Buffer.from(dataRcv), this.helperArr);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.helperArr.length; ++i) {
            if (this.state === ClientState.Closed)
                return;
            const pack = this.helperArr[i];
            if (!this.handlers.has(pack.type)) {
                throw new Error(`invalid package type: ${pack.type.toString()}`);
            }
            this.handlers.get(pack.type)?.handle(pack.body);
        }
    }
    onDrain() {
        this.flush();
    }
    sendBuffer(buffer) {
        this.buffer.push(buffer);
        this.flush();
    }
    disconnect() {
        this.socket.end(0);
        this.state = ClientState.Closed;
    }
    dispose() {
        this.handlers.forEach((handler) => {
            handler.dispose?.call(handler);
        });
        this.handlers.clear();
    }
    flush() {
        const len = this.buffer.length;
        if (len === 0)
            return;
        let i = 0;
        for (; i < len; ++i) {
            const msg = this.buffer[i];
            const state = this.socket.send(msg, true);
            if (state === 2) {
                break;
            }
        }
        if (i > 0) {
            if (i === len)
                this.buffer.length = 0;
            else
                this.buffer.splice(0, i);
        }
    }
}