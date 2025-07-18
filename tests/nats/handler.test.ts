/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server.mjs';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport.mjs';
import { ClientManager } from '../../src/component/ClientManager.mjs';
import { NatsComponent } from '../../src/nats/NatsComponent.mjs';
import { Router } from '../../src/router/Router.mjs';
import { S2CSubscriber } from '../../src/router/subscribers/S2CSubscriber.mjs';
import type { MessageEvent, WebSocket } from 'ws';
import { createConnection, decodeClientData } from '../utils/testUtils.mjs';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor.mjs';
import * as packUtil from '../../src/transport/protocol/PacketProcessor.mjs';
import { Proto } from '../utils/Proto.mjs';
import { PushSender } from '../../src/router/PushSender.mjs';
import { StatelessHandlerSubscriber } from '../../src/router/subscribers/StatelessHandlerSubscriber.mjs';
import { StatefulHandlerSubscriber } from '../../src/router/subscribers/StatefulHandlerSubscriber.mjs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { loadHandlersAndRemotes, routerUtils, serverSelector } from '../../src/index.mjs';

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
    server = new Server('connector', id1);
    server.addComponent(UWebSocketTransport);
    const transport = server.getComponent(UWebSocketTransport);
    if (transport) transport.port = 9002;
    server.addComponent(ClientManager);
    server.addComponent(Router);
    server.addComponent(S2CSubscriber);
    server.addComponent(NatsComponent);

    server2 = new Server('game', id2);
    server2.addComponent(StatelessHandlerSubscriber);
    server2.addComponent(StatefulHandlerSubscriber);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    loadHandlersAndRemotes(__dirname);
    server2.addComponent(PushSender);
    server2.addComponent(NatsComponent);
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
        server3 = new Server('game', id3);
        server3.addComponent(StatelessHandlerSubscriber);
        server3.addComponent(StatefulHandlerSubscriber);
        server3.addComponent(NatsComponent);
        await server3.start();
    });

    afterAll(() => {
        server3.shutdown();
    });

    test('req/resp', async () => {
        const socket = await createConnection(9002);
        // the two StatelessRouteSubscribers have the same prototype
        const mockP = jest.spyOn(StatelessHandlerSubscriber.prototype as any, 'process');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        const nc = server.getComponent(NatsComponent)?.nc;
        if (!nc) return;
        const mockRequest = jest.spyOn(nc, 'request');
        const reqId = 32;
        const result = await testReq(socket, reqId);
        expect(result.id).toBe(reqId);
        expect(result.body.name).toBe('Hello Game');
        expect(mockP).toHaveBeenCalledTimes(1);
        expect(mockHandler).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledTimes(1);
        socket.close();
        jest.clearAllMocks();
    });

    test('stateful req/resp', async () => {
        const socket = await createConnection(9002);
        let rsb = server2.getComponent(StatefulHandlerSubscriber);
        if (!rsb) return;
        // the two StatelessRouteSubscribers have the same prototype
        const mockPc2 = jest.fn(Object.getPrototypeOf(rsb).process);
        (rsb as any).process = mockPc2;
        rsb = server3.getComponent(StatefulHandlerSubscriber);
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
        expect(mockHandler).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockPc3).not.toHaveBeenCalled();
        expect(mockPc2).toHaveBeenCalledTimes(1);
        ((serverSelector as any).routes as Map<any, any>).clear();
        socket.close();
        jest.clearAllMocks();
    });

    test('client to server notification', async () => {
        const socket = await createConnection(9002);
        const nc = server.getComponent(NatsComponent)?.nc;
        expect(nc).not.toBeUndefined();
        if (!nc) return;
        const mockPublish = jest.spyOn(nc, 'publish');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        const rsb = server2.getComponent(StatelessHandlerSubscriber);
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
                expect(mockPublish).toHaveBeenCalledTimes(1);
                expect(mockHandler).toHaveBeenCalledTimes(1);
                expect(mockHandler.mock.results[0].value).resolves.toBeUndefined();
                expect(mockHandler.mock.calls[0][0].protoId).toBe(Proto.GameUpdate);
                expect(mockHandler.mock.calls[0][0].clientId).toBe(1);
                expect(mockP1).toHaveBeenCalledTimes(1);
                expect((mockP1.mock.calls[0][0] as any).reply).toBe('');
                socket.close();
                jest.clearAllMocks();
                resolve();
            }, 20);
        });
    });

    test('stateful client to server notification', async () => {
        const socket = await createConnection(9002);
        serverSelector.addRoute('game', async () => {
            return id3;
        });
        const nc = server.getComponent(NatsComponent)?.nc;
        expect(nc).not.toBeUndefined();
        if (!nc) return;
        const mockPublish = jest.spyOn(nc, 'publish');
        const mockHandler = jest.spyOn(routerUtils, 'handle');
        let rsb = server2.getComponent(StatefulHandlerSubscriber);
        if (!rsb) return;
        const mockPc2 = jest.fn(Object.getPrototypeOf(rsb).process);
        (rsb as any).process = mockPc2;
        rsb = server3.getComponent(StatefulHandlerSubscriber);
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
                expect(mockPublish).toHaveBeenCalledTimes(1);
                expect(mockHandler).toHaveBeenCalledTimes(1);
                expect(mockHandler.mock.results[0].value).resolves.toBeUndefined();
                expect(mockHandler.mock.calls[0][0].protoId).toBe(Proto.GameUpdate);
                expect(mockHandler.mock.calls[0][0].clientId).toBe(1);
                expect(mockPc3).toHaveBeenCalledTimes(1);
                expect((mockPc3.mock.calls[0][0] as any).reply).toBe('');
                expect(mockPc2).not.toHaveBeenCalled();
                socket.close();
                jest.clearAllMocks();
                resolve();
            }, 20);
        });
    });

    test('server to client notification(push)', async () => {
        const socket = await createConnection(9002);
        return new Promise<any>((resolve) => {
            socket.onmessage = (e: MessageEvent) => {
                resolve(decodeClientData(Buffer.from(e.data as ArrayBuffer)));
            };
            const sender = server2.getComponent(PushSender);
            sender?.send(
                {
                    clientId: 1,
                    protoId: Proto.PushToClient,
                    sUuid: id1,
                    uid: '',
                    roleid: '',
                    reqId: 0,
                },
                { name: 'Hello Game' }
            );
        }).then((result) => {
            expect(result.id).toBe(0);
            expect(result.route).toBe(Proto.PushToClient);
            expect(result.body.name).toBe('Hello Game');
            socket.close();
            jest.clearAllMocks();
        });
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
            resolve(decodeClientData(Buffer.from(e.data as ArrayBuffer)));
        };
        const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
        socket.send(pkg);
    });
    return result;
}
