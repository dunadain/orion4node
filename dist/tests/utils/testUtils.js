"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTcpConnection = exports.decodeClientData = exports.createConnection = void 0;
const ws_1 = require("ws");
const packUtil = require("../../src/transport/protocol/PacketProcessor");
const msgUtil = require("../../src/transport/protocol/MsgProcessor");
const net = require("net");
const utils_1 = require("../../src/transport/protocol/utils");
function createConnection(port, obj) {
    return new Promise((resolve) => {
        const newSocket = new ws_1.WebSocket(`ws://localhost:${port.toString()}`);
        if (obj)
            obj.socket = newSocket;
        newSocket.onopen = () => {
            newSocket.send(packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } }))));
        };
        newSocket.onmessage = (e) => {
            const buffer = Buffer.from(e.data);
            const pkgs = packUtil.decode(buffer);
            const pkg = pkgs[0];
            if (pkg.type === packUtil.PackType.HANDSHAKE) {
                newSocket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
                setTimeout(() => {
                    resolve(newSocket);
                }, 10);
            }
        };
    });
}
exports.createConnection = createConnection;
function decodeClientData(e) {
    const buffer = e;
    const pkgs = packUtil.decode(buffer);
    if (pkgs[0].type === packUtil.PackType.DATA) {
        if (pkgs[0].body) {
            const decodedMsg = msgUtil.decode(pkgs[0].body);
            const parsedObj = JSON.parse(decodedMsg.body.toString());
            return {
                id: decodedMsg.id,
                route: decodedMsg.route,
                body: parsedObj,
            };
        }
    }
}
exports.decodeClientData = decodeClientData;
function createTcpConnection(port, host, clientVersion = 1) {
    return new Promise((resolve) => {
        const client = net.createConnection({ port, host }, () => {
            const uidBuf = Buffer.from('myuuid');
            const buf = Buffer.alloc(5 + uidBuf.length);
            let offset = 0;
            buf.writeUInt8(uidBuf.length, offset++); // uid length
            (0, utils_1.copyArray)(buf, offset, uidBuf, 0, uidBuf.length);
            offset += uidBuf.length;
            buf.writeUint32BE(clientVersion, offset++); // client version
            const handshakePact = packUtil.encode(packUtil.PackType.HANDSHAKE, buf);
            client.write(handshakePact);
        });
        client.on('data', (buffer) => {
            const pkgs = packUtil.decode(buffer);
            const pkg = pkgs[0];
            if (pkg.type === packUtil.PackType.HANDSHAKE) {
                client.write(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
                setTimeout(() => {
                    resolve(client);
                }, 10);
            }
        });
    });
}
exports.createTcpConnection = createTcpConnection;
