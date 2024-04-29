"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeClientData = exports.createConnection = void 0;
const ws_1 = require("ws");
const packUtil = __importStar(require("../../src/transport/protocol/PacketProcessor"));
const msgUtil = __importStar(require("../../src/transport/protocol/MsgProcessor"));
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
