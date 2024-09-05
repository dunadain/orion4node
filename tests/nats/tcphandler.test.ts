import { afterAll, beforeAll, describe, expect, it, jest, test } from '@jest/globals';
import * as net from 'net';
import {
    ErrorCode,
    loadHandlersAndRemotes,
    msgUtils,
    NatsComponent,
    packUtils,
    PushSender,
    Server,
    StatefulHandlerSubscriber,
    StatelessHandlerSubscriber,
} from '../../src/index.mjs';
import { createTcpConnection, decodeClientData } from '../utils/testUtils.mjs';
import { Proto } from '../utils/Proto.mjs';
import { copyArray } from '../../src/transport/protocol/utils.mjs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const data = {
    a: 1,
    b: '223d',
    c: true,
    dsldksdjfk: '$$####asfdjal',
};

let server2: Server;
const id2 = 2;
beforeAll(async () => {
    server2 = new Server('game', id2);
    server2.addComponent(NatsComponent);
    server2.addComponent(StatelessHandlerSubscriber);
    server2.addComponent(StatefulHandlerSubscriber);
    server2.addComponent(PushSender);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    loadHandlersAndRemotes(__dirname);
    try {
        await server2.start();
    } catch (reason) {
        console.error(reason);
    }
});

afterAll(() => {
    server2.shutdown();
});

describe('tcp communication', () => {
    let client: net.Socket;
    beforeAll(async () => {
        client = await createTcpConnection(9001, '127.0.0.1');
    });
    afterAll(() => {
        client.end();
        jest.clearAllMocks();
    });
    test('should send and receive data', async () => {
        const mockP = jest.spyOn(StatelessHandlerSubscriber.prototype as any, 'process');
        // const mockHandler = jest.spyOn(routerUtils, 'handle');
        const reqId = 32;
        const result = await testReq(client, reqId);
        expect(result.id).toBe(reqId);
        expect(result.body.name).toBe('Hello Game');
        expect(mockP).toBeCalledTimes(1);
        // expect(mockHandler).toBeCalledTimes(1);
    });
});

describe('report error', () => {
    it('should report handshake error', async () => {
        const [errCode, errMsg] = await new Promise<[number, string]>((resolve) => {
            const client = net.createConnection({ port: 9001, host: '127.0.0.1' }, () => {
                const uidBuf = Buffer.from('myuuid');
                const buf = Buffer.alloc(1 + uidBuf.length);
                let offset = 0;
                buf.writeUInt8(uidBuf.length, offset++);
                copyArray(buf, offset, uidBuf, 0, uidBuf.length);
                offset += uidBuf.length;

                const handshakePact = packUtils.encode(packUtils.PackType.HANDSHAKE, buf);
                client.write(handshakePact);
            });
            client.on('data', (buffer) => {
                const pkgs = packUtils.decode(buffer);
                const pkg = pkgs[0];
                if (pkg.type === packUtils.PackType.ERROR) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errCode = pkg.body!.readUint16BE(0);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errMsg = pkg.body!.subarray(2).toString();
                    resolve([errCode, errMsg]);
                }
            });
        });
        expect(errCode).toBe(ErrorCode.InvaildHandShakeInfo);
        expect(errMsg).toBe('invalid handshake');
    });
    it('should report empty error', async () => {
        const [errCode, errMsg] = await new Promise<[number, string]>((resolve) => {
            const client = net.createConnection({ port: 9001, host: '127.0.0.1' }, () => {
                const uidBuf = Buffer.from('');
                const buf = Buffer.alloc(5 + uidBuf.length);
                let offset = 0;
                buf.writeUInt8(uidBuf.length, offset++);
                copyArray(buf, offset, uidBuf, 0, uidBuf.length);
                offset += uidBuf.length;
                buf.writeUint32BE(1, offset++);
                const handshakePact = packUtils.encode(packUtils.PackType.HANDSHAKE, buf);
                client.write(handshakePact);
            });
            client.on('data', (buffer) => {
                const pkgs = packUtils.decode(buffer);
                const pkg = pkgs[0];
                if (pkg.type === packUtils.PackType.ERROR) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errCode = pkg.body!.readUint16BE(0);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errMsg = pkg.body!.subarray(2).toString();
                    resolve([errCode, errMsg]);
                }
            });
        });
        expect(errCode).toBe(ErrorCode.InvalidUID);
        expect(errMsg).toBe('empty uid');
    });
});

async function testReq(socket: net.Socket, reqId: number) {
    const encodedMsg = msgUtils.encode(
        reqId,
        msgUtils.MsgType.REQUEST,
        Proto.GameLogin,
        Buffer.from(JSON.stringify(data), 'utf8')
    );
    const result: { id: number; route: number; body: any } = await new Promise<any>((resolve) => {
        socket.removeAllListeners('data');
        socket.on('data', (buffer) => {
            resolve(decodeClientData(buffer));
        });
        const pkg = packUtils.encode(packUtils.PackType.DATA, encodedMsg);
        socket.write(pkg);
    });
    return result;
}
