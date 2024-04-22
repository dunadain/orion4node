import { MessageEvent, WebSocket } from 'ws';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor';

export function createConnection(port: number, obj?: any) {
    return new Promise<WebSocket>((resolve) => {
        const newSocket = new WebSocket(`ws://localhost:${port.toString()}`);
        if (obj) obj.socket = newSocket;
        newSocket.onopen = () => {
            newSocket.send(
                packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } })))
            );
        };
        newSocket.onmessage = (e: MessageEvent) => {
            const buffer = Buffer.from(e.data as ArrayBuffer);
            const pkgs = packUtil.decode(buffer);
            const pkg = pkgs[0];
            if (pkg.type === packUtil.PackType.HANDSHAKE) {
                newSocket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
            } else if (pkg.type === packUtil.PackType.HANDSHAKE_ACK) {
                resolve(newSocket);
            }
        };
    });
}

export function decodeClientData(e: MessageEvent) {
    const buffer = Buffer.from(e.data as ArrayBuffer);
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
