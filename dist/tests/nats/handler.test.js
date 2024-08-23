"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const globals_1 = require("@jest/globals");
const Server_1 = require("../../src/server/Server");
const UWebSocketTransport_1 = require("../../src/transport/uws/UWebSocketTransport");
const ClientManager_1 = require("../../src/component/ClientManager");
const NatsComponent_1 = require("../../src/nats/NatsComponent");
const Router_1 = require("../../src/router/Router");
const S2CSubscriber_1 = require("../../src/router/subscribers/S2CSubscriber");
const FileLoader_1 = require("../../src/server/FileLoader");
const testUtils_1 = require("../utils/testUtils");
const msgUtil = require("../../src/transport/protocol/MsgProcessor");
const packUtil = require("../../src/transport/protocol/PacketProcessor");
const Proto_1 = require("../utils/Proto");
const routerUtils = require("../../src/router/RouterUtils");
const PushSender_1 = require("../../src/router/PushSender");
const StatelessRouteSubscriber_1 = require("../../src/router/subscribers/StatelessRouteSubscriber");
const StatefulRouteSubscriber_1 = require("../../src/router/subscribers/StatefulRouteSubscriber");
const ServerSelector_1 = require("../../src/router/ServerSelector");
const data = {
    a: 1,
    b: '223d',
    c: true,
    dsldksdjfk: '$$####asfdjal',
};
let server;
let server2;
let server3;
const id1 = 1;
const id2 = 2;
const id3 = 3;
(0, globals_1.beforeAll)(async () => {
    server = new Server_1.Server('connector', id1);
    server.addComponent(UWebSocketTransport_1.UWebSocketTransport);
    const transport = server.getComponent(UWebSocketTransport_1.UWebSocketTransport);
    if (transport)
        transport.port = 9002;
    server.addComponent(ClientManager_1.ClientManager);
    server.addComponent(NatsComponent_1.NatsComponent);
    server.addComponent(Router_1.Router);
    server.addComponent(S2CSubscriber_1.S2CSubscriber);
    server2 = new Server_1.Server('game', id2);
    server2.addComponent(NatsComponent_1.NatsComponent);
    server2.addComponent(StatelessRouteSubscriber_1.StatelessRouteSubscriber);
    server2.addComponent(StatefulRouteSubscriber_1.StatefulRouteSubscriber);
    server2.addComponent(FileLoader_1.FileLoader);
    server2.addComponent(PushSender_1.PushSender);
    try {
        await server.start();
        await server2.start();
    }
    catch (reason) {
        console.error(reason);
    }
});
(0, globals_1.afterAll)(() => {
    server.shutdown();
    server2.shutdown();
});
(0, globals_1.describe)('communication', () => {
    (0, globals_1.beforeAll)(async () => {
        server3 = new Server_1.Server('game', id3);
        server3.addComponent(NatsComponent_1.NatsComponent);
        server3.addComponent(StatelessRouteSubscriber_1.StatelessRouteSubscriber);
        server3.addComponent(FileLoader_1.FileLoader);
        server3.addComponent(StatefulRouteSubscriber_1.StatefulRouteSubscriber);
        await server3.start();
    });
    (0, globals_1.afterAll)(() => {
        server3.shutdown();
    });
    let socket;
    (0, globals_1.beforeEach)(async () => {
        const result = {};
        const p = (0, testUtils_1.createConnection)(9002, result);
        socket = result.socket;
        await p;
    });
    (0, globals_1.afterEach)(() => {
        socket.close();
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)('req/resp', async () => {
        // the two StatelessRouteSubscribers have the same prototype
        const mockP = globals_1.jest.spyOn(StatelessRouteSubscriber_1.StatelessRouteSubscriber.prototype, 'process');
        const mockHandler = globals_1.jest.spyOn(routerUtils, 'handle');
        const nc = server.getComponent(NatsComponent_1.NatsComponent)?.nc;
        if (!nc)
            return;
        const mockRequest = globals_1.jest.spyOn(nc, 'request');
        const reqId = 32;
        const result = await testReq(socket, reqId);
        (0, globals_1.expect)(result.id).toBe(reqId);
        (0, globals_1.expect)(result.body.name).toBe('Hello Game');
        (0, globals_1.expect)(mockP).toBeCalledTimes(1);
        (0, globals_1.expect)(mockHandler).toBeCalledTimes(1);
        (0, globals_1.expect)(mockRequest).toBeCalledTimes(1);
    });
    (0, globals_1.test)('stateful req/resp', async () => {
        let rsb = server2.getComponent(StatefulRouteSubscriber_1.StatefulRouteSubscriber);
        if (!rsb)
            return;
        // the two StatelessRouteSubscribers have the same prototype
        const mockPc2 = globals_1.jest.fn(Object.getPrototypeOf(rsb).process);
        rsb.process = mockPc2;
        rsb = server3.getComponent(StatefulRouteSubscriber_1.StatefulRouteSubscriber);
        if (!rsb)
            return;
        const mockPc3 = globals_1.jest.fn(Object.getPrototypeOf(rsb).process);
        rsb.process = mockPc3;
        const mockHandler = globals_1.jest.spyOn(routerUtils, 'handle');
        const nc = server.getComponent(NatsComponent_1.NatsComponent)?.nc;
        if (!nc)
            return;
        const mockRequest = globals_1.jest.spyOn(nc, 'request');
        ServerSelector_1.serverSelector.addRoute('game', async () => {
            return id2;
        });
        const reqId = 104;
        const result = await testReq(socket, reqId);
        (0, globals_1.expect)(result.id).toBe(reqId);
        (0, globals_1.expect)(result.body.name).toBe('Hello Game');
        (0, globals_1.expect)(mockHandler).toBeCalledTimes(1);
        (0, globals_1.expect)(mockRequest).toBeCalledTimes(1);
        (0, globals_1.expect)(mockPc3).not.toBeCalled();
        (0, globals_1.expect)(mockPc2).toBeCalledTimes(1);
        ServerSelector_1.serverSelector.routes.clear();
    });
    (0, globals_1.test)('client to server notification', () => {
        const nc = server.getComponent(NatsComponent_1.NatsComponent)?.nc;
        (0, globals_1.expect)(nc).not.toBeUndefined();
        if (!nc)
            return;
        const mockPublish = globals_1.jest.spyOn(nc, 'publish');
        const mockHandler = globals_1.jest.spyOn(routerUtils, 'handle');
        const rsb = server2.getComponent(StatelessRouteSubscriber_1.StatelessRouteSubscriber);
        if (!rsb)
            return;
        const mockP1 = globals_1.jest.spyOn(Object.getPrototypeOf(rsb), 'process');
        const reqId = 0;
        const encodedMsg = msgUtil.encode(reqId, msgUtil.MsgType.NOTIFY, Proto_1.Proto.GameUpdate, Buffer.from(JSON.stringify(data), 'utf8'));
        const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
        socket.send(pkg);
        return new Promise((resolve) => {
            setTimeout(() => {
                (0, globals_1.expect)(mockPublish).toBeCalledTimes(1);
                (0, globals_1.expect)(mockHandler).toBeCalledTimes(1);
                (0, globals_1.expect)(mockHandler.mock.results[0].value).resolves.toBeUndefined();
                (0, globals_1.expect)(mockHandler.mock.calls[0][0].protoId).toBe(Proto_1.Proto.GameUpdate);
                (0, globals_1.expect)(mockHandler.mock.calls[0][0].clientId).toBe(0);
                (0, globals_1.expect)(mockP1).toBeCalledTimes(1);
                (0, globals_1.expect)(mockP1.mock.calls[0][0].reply).toBe('');
                resolve();
            }, 20);
        });
    });
    (0, globals_1.test)('stateful client to server notification', () => {
        ServerSelector_1.serverSelector.addRoute('game', async () => {
            return id3;
        });
        const nc = server.getComponent(NatsComponent_1.NatsComponent)?.nc;
        (0, globals_1.expect)(nc).not.toBeUndefined();
        if (!nc)
            return;
        const mockPublish = globals_1.jest.spyOn(nc, 'publish');
        const mockHandler = globals_1.jest.spyOn(routerUtils, 'handle');
        let rsb = server2.getComponent(StatefulRouteSubscriber_1.StatefulRouteSubscriber);
        if (!rsb)
            return;
        const mockPc2 = globals_1.jest.fn(Object.getPrototypeOf(rsb).process);
        rsb.process = mockPc2;
        rsb = server3.getComponent(StatefulRouteSubscriber_1.StatefulRouteSubscriber);
        if (!rsb)
            return;
        const mockPc3 = globals_1.jest.fn(Object.getPrototypeOf(rsb).process);
        rsb.process = mockPc3;
        const reqId = 0;
        const encodedMsg = msgUtil.encode(reqId, msgUtil.MsgType.NOTIFY, Proto_1.Proto.GameUpdate, Buffer.from(JSON.stringify(data), 'utf8'));
        const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
        socket.send(pkg);
        return new Promise((resolve) => {
            setTimeout(() => {
                (0, globals_1.expect)(mockPublish).toBeCalledTimes(1);
                (0, globals_1.expect)(mockHandler).toBeCalledTimes(1);
                (0, globals_1.expect)(mockHandler.mock.results[0].value).resolves.toBeUndefined();
                (0, globals_1.expect)(mockHandler.mock.calls[0][0].protoId).toBe(Proto_1.Proto.GameUpdate);
                (0, globals_1.expect)(mockHandler.mock.calls[0][0].clientId).toBe(0);
                (0, globals_1.expect)(mockPc3).toBeCalledTimes(1);
                (0, globals_1.expect)(mockPc3.mock.calls[0][0].reply).toBe('');
                (0, globals_1.expect)(mockPc2).not.toBeCalled();
                resolve();
            }, 20);
        });
    });
    (0, globals_1.test)('server to client notification(push)', async () => {
        return new Promise((resolve) => {
            socket.onmessage = (e) => {
                resolve((0, testUtils_1.decodeClientData)(Buffer.from(e.data)));
            };
            const sender = server2.getComponent(PushSender_1.PushSender);
            sender?.send({
                clientId: 0,
                protoId: Proto_1.Proto.PushToClient,
                sId: id1,
                uid: '',
                reqId: 0,
            }, { name: 'Hello Game' });
        }).then((result) => {
            (0, globals_1.expect)(result.id).toBe(0);
            (0, globals_1.expect)(result.route).toBe(Proto_1.Proto.PushToClient);
            (0, globals_1.expect)(result.body.name).toBe('Hello Game');
        });
    });
});
async function testReq(socket, reqId) {
    const encodedMsg = msgUtil.encode(reqId, msgUtil.MsgType.REQUEST, Proto_1.Proto.GameLogin, Buffer.from(JSON.stringify(data), 'utf8'));
    const result = await new Promise((resolve) => {
        socket.onmessage = (e) => {
            resolve((0, testUtils_1.decodeClientData)(Buffer.from(e.data)));
        };
        const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
        socket.send(pkg);
    });
    return result;
}
