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
import { StatefulRouteSubscriber } from '../../src/router/subscribers/StatefulRouteSubscriber';
import { serverSelector } from '../../src/router/ServerSelector';
import { ProtocolMgr } from '../../src/router/ProtocolMgr';

const data = {
    a: 1,
    b: '223d',
    c: true,
    dsldksdjfk: '$$####asfdjal',
};

let server: Server;
let server2: Server;
let server3: Server;
const id1 = '1';
const id2 = '2';
const id3 = '3';
beforeAll(async () => {
    server = new Server('', 9002, 'connector', id1);
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    server.addComponent(PushSubscriber);
    server.addComponent(ProtocolMgr);

    server2 = new Server('', 9003, 'game', id2);
    server2.addComponent(NatsComponent);
    server2.addComponent(StatelessRouteSubscriber);
    server2.addComponent(StatefulRouteSubscriber);
    server2.addComponent(FileLoader);
    server2.addComponent(PushSender);
    server2.addComponent(ProtocolMgr);
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
    beforeAll(async () => {
        server3 = new Server('', 9004, 'game', id3);
        server3.addComponent(NatsComponent);
        server3.addComponent(StatelessRouteSubscriber);
        server3.addComponent(FileLoader);
        server3.addComponent(StatefulRouteSubscriber);
        server3.addComponent(ProtocolMgr);
        await server3.start();
    });

    afterAll(() => {
        server3.shutdown();
    });
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
        // the two StatelessRouteSubscribers have the same prototype
        const mockP = jest.spyOn(StatelessRouteSubscriber.prototype as any, 'process');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        const nc = server.getComponent(NatsComponent)?.nc;
        if (!nc) return;
        const mockRequest = jest.spyOn(nc, 'request');
        const reqId = 32;
        const result = await testReq(socket, reqId);
        expect(result.id).toBe(reqId);
        expect(result.body.name).toBe('Hello Game');
        expect(mockP).toBeCalledTimes(1);
        expect(mockHandler).toBeCalledTimes(1);
        expect(mockRequest).toBeCalledTimes(1);
        jest.clearAllMocks();
    });

    test('stateful req/resp', async () => {
        let rsb = server2.getComponent(StatefulRouteSubscriber);
        if (!rsb) return;
        // the two StatelessRouteSubscribers have the same prototype
        const mockPc2 = jest.fn(Object.getPrototypeOf(rsb).process);
        (rsb as any).process = mockPc2;
        rsb = server3.getComponent(StatefulRouteSubscriber);
        if (!rsb) return;
        const mockPc3 = jest.fn(Object.getPrototypeOf(rsb).process);
        (rsb as any).process = mockPc3;
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        const nc = server.getComponent(NatsComponent)?.nc;
        if (!nc) return;
        const mockRequest = jest.spyOn(nc, 'request');
        serverSelector.addRoute('game', async () => {
            return id2;
        });
        const reqId = 104;
        const result = await testReq(socket, reqId);
        expect(result.id).toBe(reqId);
        expect(result.body.name).toBe('Hello Game');
        expect(mockHandler).toBeCalledTimes(1);
        expect(mockRequest).toBeCalledTimes(1);
        expect(mockPc3).not.toBeCalled();
        expect(mockPc2).toBeCalledTimes(1);
        ((serverSelector as any).routes as Map<any, any>).clear();
        jest.clearAllMocks();
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
                expect(mockP1).toBeCalledTimes(1);
                expect((mockP1.mock.calls[0][0] as any).reply).toBe('');
                jest.clearAllMocks();
                resolve();
            }, 10);
        });
    });

    test('stateful client to server notification', () => {
        serverSelector.addRoute('game', async () => {
            return id3;
        });
        const nc = server.getComponent(NatsComponent)?.nc;
        expect(nc).not.toBeUndefined();
        if (!nc) return;
        const mockPublish = jest.spyOn(nc, 'publish');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        let rsb = server2.getComponent(StatefulRouteSubscriber);
        if (!rsb) return;
        const mockPc2 = jest.fn(Object.getPrototypeOf(rsb).process);
        (rsb as any).process = mockPc2;
        rsb = server3.getComponent(StatefulRouteSubscriber);
        if (!rsb) return;
        const mockPc3 = jest.fn(Object.getPrototypeOf(rsb).process);
        (rsb as any).process = mockPc3;
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
                expect(mockPc3).toBeCalledTimes(1);
                expect((mockPc3.mock.calls[0][0] as any).reply).toBe('');
                expect(mockPc2).not.toBeCalled();
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

async function testReq(socket: WebSocket, reqId: number) {
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
    return result;
}
