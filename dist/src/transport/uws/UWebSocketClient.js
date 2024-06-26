"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UWebSocketClient = void 0;
const SocketClient_1 = require("../SocketClient");
const packUtils = require("../protocol/PacketProcessor");
const msgUtils = require("../protocol/MsgProcessor");
const HeartBeat_1 = require("../handlers/HeartBeat");
const HandShake_1 = require("../handlers/HandShake");
const HandShakeAck_1 = require("../handlers/HandShakeAck");
class UWebSocketClient {
    serverEventEmitter;
    id = 0;
    uid = '';
    socket;
    state = SocketClient_1.ClientState.Default;
    buffer = [];
    helperArr = [];
    handlers = new Map();
    constructor(serverEventEmitter) {
        this.serverEventEmitter = serverEventEmitter;
    }
    init() {
        this.handlers.set(packUtils.PackType.HANDSHAKE, new HandShake_1.HandShake(this));
        this.handlers.set(packUtils.PackType.HANDSHAKE_ACK, new HandShakeAck_1.HandShakeAck(this));
        this.handlers.set(packUtils.PackType.HEARTBEAT, new HeartBeat_1.HeartBeat(this));
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
        if (SocketClient_1.ClientState.Ready !== this.state)
            return;
        const msgBody = msgUtils.encode(reqId, type, route, msg, false);
        this.sendBuffer(packUtils.encode(packUtils.PackType.DATA, msgBody));
    }
    onMessage(dataRcv) {
        this.helperArr.length = 0;
        packUtils.decode(Buffer.from(dataRcv), this.helperArr);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.helperArr.length; ++i) {
            if (this.state === SocketClient_1.ClientState.Closed)
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
        this.state = SocketClient_1.ClientState.Closed;
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
exports.UWebSocketClient = UWebSocketClient;
