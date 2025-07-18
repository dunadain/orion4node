import { WebSocket } from 'ws';
import * as packUtil from '../../src/transport/protocol/PacketProcessor.mjs';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor.mjs';
import * as net from 'net';
import { copyArray } from '../../src/transport/protocol/utils.mjs';
export function createConnection(port, obj) {
    return new Promise((resolve) => {
        const newSocket = new WebSocket(`ws://localhost:${port.toString()}`);
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
export function decodeClientData(e) {
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
export function createTcpConnection(port, host, clientVersion = 1) {
    return new Promise((resolve) => {
        const client = net.createConnection({ port, host }, () => {
            const uidBuf = Buffer.from('myuuid');
            const buf = Buffer.alloc(5 + uidBuf.length);
            let offset = 0;
            buf.writeUInt8(uidBuf.length, offset++); // uid length
            copyArray(buf, offset, uidBuf, 0, uidBuf.length);
            offset += uidBuf.length;
            buf.writeUint32BE(clientVersion, offset++); // client version
            const handshakePact = packUtil.encode(packUtil.PackType.HANDSHAKE, buf);
            client.write(new Uint8Array(handshakePact));
        });
        client.on('data', (buffer) => {
            const pkgs = packUtil.decode(buffer);
            const pkg = pkgs[0];
            if (pkg.type === packUtil.PackType.HANDSHAKE) {
                client.write(new Uint8Array(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK)));
                setTimeout(() => {
                    resolve(client);
                }, 10);
            }
        });
    });
}
