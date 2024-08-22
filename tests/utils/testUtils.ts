import { MessageEvent, WebSocket } from 'ws';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor';
import * as net from 'net';
import { copyArray } from '../../src/transport/protocol/utils';

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
                setTimeout(() => {
                    resolve(newSocket);
                }, 10);
            }
        };
    });
}

export function decodeClientData(e: Buffer) {
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

export function createTcpConnection(port: number, host: string) {
    return new Promise<net.Socket>((resolve) => {
        const client = net.createConnection({ port, host }, () => {
            const uidBuf = Buffer.from('myuuid');
            const buf = Buffer.alloc(5 + uidBuf.length);
            let offset = 0;
            buf.writeUInt8(uidBuf.length, offset++);
            copyArray(buf, offset, uidBuf, 0, uidBuf.length);
            offset += uidBuf.length;
            buf.writeUInt8(1, offset++);
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
