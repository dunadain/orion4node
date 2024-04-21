/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { ClientManager } from '../../src/component/ClientManager';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { RouteSubscriber } from '../../src/router/subscribers/RouteSubscriber';
import { PushSubscriber } from '../../src/router/subscribers/PushSubscriber';
import { FileLoader } from '../../src/router/FileLoader';
import { MessageEvent, WebSocket } from 'ws';
import { createConnection } from '../utils/testUtils';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';
import { Proto } from '../utils/Proto';
import * as routerUtils from '../../src/router/RouterUtils';

let server: Server;
let server2: Server;
let server3: Server;
beforeAll(async () => {
    server = new Server('', 9002, 'connector', '1');
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    server.addComponent(PushSubscriber);

    server2 = new Server('', 9003, 'game', '2');
    server2.addComponent(NatsComponent);
    server2.addComponent(RouteSubscriber);
    server2.addComponent(FileLoader);
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
        server3.addComponent(RouteSubscriber);
        server3.addComponent(FileLoader);
        await server3.start();
        let rsb = server2.getComponent(RouteSubscriber) as any;
        const mockP1 = jest.spyOn(rsb, 'process');
        rsb = server3.getComponent(RouteSubscriber) as any;
        const mockP2 = jest.spyOn(rsb, 'process');
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
        expect(result.body.name).toBe('Hello Game');
        const numCalls = Number(mockP1.mock.calls.length) + Number(mockP2.mock.calls.length);
        expect(numCalls).toBe(1);
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
        const rsb = server2.getComponent(RouteSubscriber) as any;
        const mockP1 = jest.spyOn(rsb, 'process');
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
                expect(mockHandler.mock.calls[0][0]).toBe(Proto.GameUpdate);
                expect(mockHandler.mock.calls[0][1].id).toBe(1);
                expect((mockP1.mock.calls[0][0] as any).reply).toBe('');
                jest.clearAllMocks();
                resolve();
            }, 10);
        });
    });
});
