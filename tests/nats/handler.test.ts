/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { ClientManager } from '../../src/component/ClientManager';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { PushSubscriber } from '../../src/router/subscribers/PushSubscriber';
import { FileLoader } from '../../src/server/FileLoader';
import { MessageEvent, WebSocket } from 'ws';
import { createConnection, decodeClientData } from '../utils/testUtils';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';
import { Proto } from '../utils/Proto';
import * as routerUtils from '../../src/router/RouterUtils';
import { PushSender } from '../../src/router/PushSender';
import { StatelessRouteSubscriber } from '../../src/router/subscribers/StatelessRouteSubscriber';

let server: Server;
let server2: Server;
let server3: Server;
const id1 = '1';
const id2 = '2';
beforeAll(async () => {
    server = new Server('', 9002, 'connector', id1);
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    server.addComponent(PushSubscriber);

    server2 = new Server('', 9003, 'game', id2);
    server2.addComponent(NatsComponent);
    server2.addComponent(StatelessRouteSubscriber);
    server2.addComponent(FileLoader);
    server2.addComponent(PushSender);
    try {
        await server.start();
        await server2.start();
    } catch (reason) {
        console.error(reason);
    }
});

afterAll(() => {
    server.shutdown();
    server2.shutdown();
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
        server3 = new Server('', 9004, 'game', '3');
        server3.addComponent(NatsComponent);
        server3.addComponent(StatelessRouteSubscriber);
        server3.addComponent(FileLoader);
        await server3.start();
        const rsb = server2.getComponent(StatelessRouteSubscriber);
        if (!rsb) return;
        // the two StatelessRouteSubscribers have the same prototype
        const mockP = jest.spyOn(Object.getPrototypeOf(rsb), 'process');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        const nc = server.getComponent(NatsComponent)?.nc;
        if (!nc) return;
        const mockRequest = jest.spyOn(nc, 'request');
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
                resolve(decodeClientData(e));
            };
            const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
            socket.send(pkg);
        });
        expect(result.id).toBe(reqId);
        expect(result.body.name).toBe('Hello Game');
        expect(mockP).toBeCalledTimes(1);
        expect(mockHandler).toBeCalledTimes(1);
        expect(mockRequest).toBeCalledTimes(1);
        jest.clearAllMocks();
        server3.shutdown();
    });

    test('client to server notification', () => {
        const nc = server.getComponent(NatsComponent)?.nc;
        expect(nc).not.toBeUndefined();
        if (!nc) return;
        const mockPublish = jest.spyOn(nc, 'publish');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        const rsb = server2.getComponent(StatelessRouteSubscriber);
        if (!rsb) return;
        const mockP1 = jest.spyOn(Object.getPrototypeOf(rsb), 'process');
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        const reqId = 0;
        const encodedMsg = msgUtil.encode(
            reqId,
            msgUtil.MsgType.NOTIFY,
            Proto.GameUpdate,
            Buffer.from(JSON.stringify(data), 'utf8')
        );
        const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
        socket.send(pkg);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(mockPublish).toBeCalledTimes(1);
                expect(mockHandler).toBeCalledTimes(1);
                expect(mockHandler.mock.results[0].value).resolves.toBeUndefined();
                expect(mockHandler.mock.calls[0][0].protoId).toBe(Proto.GameUpdate);
                expect(mockHandler.mock.calls[0][0].id).toBe(1);
                expect((mockP1.mock.calls[0][0] as any).reply).toBe('');
                jest.clearAllMocks();
                resolve();
            }, 10);
        });
    });

    test('server to client notification(push)', async () => {
        const result = await new Promise<any>((resolve) => {
            socket.onmessage = (e: MessageEvent) => {
                resolve(decodeClientData(e));
            };
            const sender = server2.getComponent(PushSender);
            sender?.send({ id: 1, protoId: Proto.PushToClient, sId: id1 }, { name: 'Hello Game' });
        });
        expect(result.id).toBe(0);
        expect(result.route).toBe(Proto.PushToClient);
        expect(result.body.name).toBe('Hello Game');
    });
});
