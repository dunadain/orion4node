import { MessageEvent, WebSocket } from 'ws';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';

export function createConnection(port: number, obj?: any) {
    return new Promise<void>((resolve) => {
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
                resolve();
            }
        };
    });
}
