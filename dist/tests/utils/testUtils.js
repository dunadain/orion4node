"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeClientData = exports.createConnection = void 0;
const ws_1 = require("ws");
const packUtil = require("../../src/transport/protocol/PacketProcessor");
const msgUtil = require("../../src/transport/protocol/MsgProcessor");
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
            }
            else if (pkg.type === packUtil.PackType.HANDSHAKE_ACK) {
                resolve(newSocket);
            }
        };
    });
}
exports.createConnection = createConnection;
function decodeClientData(e) {
    const buffer = Buffer.from(e.data);
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
