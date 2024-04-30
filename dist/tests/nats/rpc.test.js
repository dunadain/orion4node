"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Server_1 = require("../../src/server/Server");
const NatsComponent_1 = require("../../src/nats/NatsComponent");
const RpcClient_1 = require("../../src/rpc/RpcClient");
const StatelessRpcSubscriber_1 = require("../../src/rpc/StatelessRpcSubscriber");
const FileLoader_1 = require("../../src/server/FileLoader");
const StatefulRpcSubscriber_1 = require("../../src/rpc/StatefulRpcSubscriber");
const root = require("./proto/compiled");
const RpcSubscriber_1 = require("../../src/rpc/RpcSubscriber");
const path = require("node:path");
const rpc = require("../../src/rpc/RpcUtils");
let server;
let server2;
let server3;
const id1 = '1';
const id2 = '2';
const id3 = '3';
(0, globals_1.beforeAll)(async () => {
    server = new Server_1.Server('', 9005, 'chat', id1);
    server.addComponent(NatsComponent_1.NatsComponent);
    const client = server.addComponent(RpcClient_1.RpcClient);
    client.addServices(root, 'game');
    const protoPath = path.join(__dirname, 'proto', 'compiled');
    server2 = new Server_1.Server('', 9006, 'game', id2);
    server2.addComponent(NatsComponent_1.NatsComponent);
    let rpcSub = server2.addComponent(StatelessRpcSubscriber_1.StatelessRpcSubscriber);
    rpcSub.protoPath = protoPath;
    rpcSub = server2.addComponent(StatefulRpcSubscriber_1.StatefulRpcSubscriber);
    rpcSub.protoPath = protoPath;
    server2.addComponent(FileLoader_1.FileLoader);
    server3 = new Server_1.Server('', 9007, 'game', id3);
    server3.addComponent(NatsComponent_1.NatsComponent);
    rpcSub = server3.addComponent(StatelessRpcSubscriber_1.StatelessRpcSubscriber);
    rpcSub.protoPath = protoPath;
    rpcSub = server3.addComponent(StatefulRpcSubscriber_1.StatefulRpcSubscriber);
    rpcSub.protoPath = protoPath;
    server3.addComponent(FileLoader_1.FileLoader);
    try {
        await server.start();
        await server2.start();
        await server3.start();
    }
    catch (reason) {
        console.error(reason);
    }
});
(0, globals_1.afterAll)(() => {
    server.shutdown();
    server2.shutdown();
    server3.shutdown();
});
(0, globals_1.describe)('rpc tests', () => {
    (0, globals_1.afterEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)('stateless rpc call', async () => {
        const client = server.getComponent(RpcClient_1.RpcClient);
        if (!client)
            return;
        const mockP = globals_1.jest.spyOn(RpcSubscriber_1.RpcSubscriber.prototype, 'process');
        await (0, globals_1.expect)(client.getService(root.Greeter).sayHello({ name: 'world' })).resolves.toEqual({
            message: 'Hello, world',
        });
        (0, globals_1.expect)(mockP).toBeCalledTimes(1);
        await (0, globals_1.expect)(client.getService(root.Greeter).sayHello({ name: 'world' })).resolves.toEqual({
            message: 'Hello, world',
        });
        (0, globals_1.expect)(mockP).toBeCalledTimes(2);
    });
    (0, globals_1.test)('stateful rpc call', async () => {
        const client = server.getComponent(RpcClient_1.RpcClient);
        if (!client)
            return;
        const mockP1 = globals_1.jest.fn(RpcSubscriber_1.RpcSubscriber.prototype.process);
        server2.getComponent(StatefulRpcSubscriber_1.StatefulRpcSubscriber).process = mockP1;
        const mockP2 = globals_1.jest.fn(RpcSubscriber_1.RpcSubscriber.prototype.process);
        server3.getComponent(StatefulRpcSubscriber_1.StatefulRpcSubscriber).process = mockP2;
        await (0, globals_1.expect)(client.getService(root.Greeter).to(id2).sayHello({ name: 'world' })).resolves.toEqual({
            message: 'Hello, world',
        });
        (0, globals_1.expect)(mockP1).toBeCalledTimes(1);
        (0, globals_1.expect)(mockP2).not.toBeCalled();
    });
    (0, globals_1.test)('rpc publish', () => {
        const client = server.getComponent(RpcClient_1.RpcClient);
        if (!client)
            return;
        const nats = server.getComponent(NatsComponent_1.NatsComponent)?.nc;
        if (!nats)
            return;
        const mockPub = globals_1.jest.spyOn(nats, 'publish');
        const mockReq = globals_1.jest.spyOn(nats, 'request');
        const mockCallRpc = globals_1.jest.spyOn(rpc, 'callRpc');
        client.getService(root.Greeter).bar({});
        (0, globals_1.expect)(mockPub).toBeCalledTimes(1);
        (0, globals_1.expect)(mockReq).not.toBeCalled();
        return new Promise((resolve) => {
            setTimeout(() => {
                (0, globals_1.expect)(mockCallRpc).toBeCalledTimes(1);
                (0, globals_1.expect)(mockCallRpc.mock.results[0].value).resolves.toEqual({});
                resolve();
            }, 100);
        });
    });
    (0, globals_1.test)('rpc fail', async () => {
        const client = server.getComponent(RpcClient_1.RpcClient);
        if (!client)
            return;
        const nats = server.getComponent(NatsComponent_1.NatsComponent);
        if (!nats)
            return;
        globals_1.jest.spyOn(nats, 'tryRequest').mockRejectedValue(new Error('timeout'));
        await (0, globals_1.expect)(client.getService(root.Greeter).to(id2).sayHello({ name: 'world' })).rejects.toThrow('timeout');
    });
});
