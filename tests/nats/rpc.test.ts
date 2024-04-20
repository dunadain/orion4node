/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { ClientManager } from '../../src/component/ClientManager';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { RouteSubscriber } from '../../src/router/RouteSubscriber';
import { PushSubscriber } from '../../src/router/PushSubscriber';
import { FileLoader } from '../../src/router/FileLoader';
import { MessageEvent, WebSocket } from 'ws';
import { createConnection } from '../utils/testUtils';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';
import { Proto } from '../utils/Proto';

let server: Server;
let server2: Server;
let server3: Server;
let mockCb1: any;
let mockCb2: any;
beforeAll(async () => {
    server = new Server('', 9002, 'connector', '1');
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    server.addComponent(PushSubscriber);

    server2 = new Server('', 9003, 'game', '2');
    server2.addComponent(NatsComponent);
    const rsc = server2.addComponent(RouteSubscriber) as any;
    mockCb1 = jest.fn(rsc.callback);
    rsc.callback = mockCb1;
    server2.addComponent(FileLoader);

    server3 = new Server('', 9004, 'game', '3');
    server3.addComponent(NatsComponent);
    const rsc2 = server3.addComponent(RouteSubscriber) as any;
    mockCb2 = jest.fn(rsc2.callback);
    rsc2.callback = mockCb2;
    server3.addComponent(FileLoader);
    try {
        await server.start();
        await server2.start();
        await server3.start();
    } catch (reason) {
        console.error(reason);
    }
});

afterAll(() => {
    server.shutdown();
    server2.shutdown();
    server3.shutdown();
});

describe('communication', () => {
    let socket: WebSocket;
    beforeEach(async () => {
        const result: any = {};
        const p = createConnection(9002, result);
        socket = result.socket;
        await p;
    });
    afterEach(() => {
        socket.close();
    });
    test('req/resp', async () => {
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        const reqId = 32;
        const encodedMsg = msgUtil.encode(
            reqId,
            msgUtil.MsgType.REQUEST,
            Proto.GameLogin,
            Buffer.from(JSON.stringify(data), 'utf8')
        );
        const result: { id: number; route: number; body: any } = await new Promise<any>((resolve) => {
            socket.onmessage = (e: MessageEvent) => {
                const buffer = Buffer.from(e.data as ArrayBuffer);
                const pkgs = packUtil.decode(buffer);
                if (pkgs[0].type === packUtil.PackType.DATA) {
                    if (pkgs[0].body) {
                        const decodedMsg = msgUtil.decode(pkgs[0].body);
                        const parsedObj = JSON.parse(decodedMsg.body.toString());
                        resolve({
                            id: decodedMsg.id,
                            route: decodedMsg.route,
                            body: parsedObj,
                        });
                    }
                }
            };
            const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
            socket.send(pkg);
        });
        expect(result.id).toBe(reqId);
        expect(result.body.name);
        const numCalls = Number(mockCb1.mock.calls.length) + Number(mockCb2.mock.calls.length);
        expect(numCalls).toBe(1);
    });
});
