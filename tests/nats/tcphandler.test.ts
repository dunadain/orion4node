import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import * as net from 'net';
import {
    FileLoader,
    msgUtils,
    NatsComponent,
    packUtils,
    PushSender,
    Server,
    StatefulRouteSubscriber,
    StatelessRouteSubscriber,
} from '../../src';
import { createTcpConnection, decodeClientData } from '../utils/testUtils';
import { Proto } from '../utils/Proto';

const data = {
    a: 1,
    b: '223d',
    c: true,
    dsldksdjfk: '$$####asfdjal',
};

let server2: Server;
const id2 = 2;
beforeAll(async () => {
    server2 = new Server('', 9003, 'game', id2);
    server2.addComponent(NatsComponent);
    server2.addComponent(StatelessRouteSubscriber);
    server2.addComponent(StatefulRouteSubscriber);
    server2.addComponent(FileLoader);
    server2.addComponent(PushSender);
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
    test('should send and receive data', async () => {
        const client = await createTcpConnection(9001, '127.0.0.1');
        const reqId = 32;
        const result = await testReq(client, reqId);
        expect(result.id).toBe(reqId);
        expect(result.body.name).toBe('Hello Game');
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
