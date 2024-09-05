import { afterAll, afterEach, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server.mjs';
import { NatsComponent } from '../../src/nats/NatsComponent.mjs';
import { RpcClient } from '../../src/rpc/RpcClient.mjs';
import { StatelessRpcServer } from '../../src/rpc/StatelessRpcServer.mjs';
import { StatefulRpcServer } from '../../src/rpc/StatefulRpcServer.mjs';
import root from './proto/compiled.cjs';
import type { Root } from 'protobufjs';
import { RpcServerBase } from '../../src/rpc/RpcServerBase.mjs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { loadHandlersAndRemotes, rpcUtils } from '../../src/index.mjs';

let server: Server;
let server2: Server;
let server3: Server;
const id1 = 1;
const id2 = 2;
const id3 = 3;
beforeAll(async () => {
    server = new Server('chat', id1);
    server.addComponent(NatsComponent);
    const client = server.addComponent(RpcClient);
    const pkgRoot = (root as unknown as Root).lookup('');
    client.addServices(pkgRoot, 'game');

    server2 = new Server('game', id2);
    server2.addComponent(NatsComponent);
    let rpcSub = server2.addComponent(StatelessRpcServer);
    rpcSub.protoRoot = root as unknown as Root;
    rpcSub = server2.addComponent(StatefulRpcServer);
    rpcSub.protoRoot = root as unknown as Root;

    server3 = new Server('game', id3);
    server3.addComponent(NatsComponent);
    rpcSub = server3.addComponent(StatelessRpcServer);
    rpcSub.protoRoot = root as unknown as Root;
    rpcSub = server3.addComponent(StatefulRpcServer);
    rpcSub.protoRoot = root as unknown as Root;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    await loadHandlersAndRemotes(__dirname);

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

describe('rpc tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('stateless rpc call', async () => {
        const client = server.getComponent(RpcClient);
        if (!client) return;
        const mockP = jest.spyOn(RpcServerBase.prototype as any, 'process');
        await expect(client.getService(root.Greeter).sayHello({ name: 'world' })).resolves.toEqual({
            message: 'Hello, world',
        });
        expect(mockP).toBeCalledTimes(1);
        await expect(client.getService(root.Greeter).sayHello({ name: 'world' })).resolves.toEqual({
            message: 'Hello, world',
        });
        expect(mockP).toBeCalledTimes(2);
    });

    test('stateful rpc call', async () => {
        const client = server.getComponent(RpcClient);
        if (!client) return;
        const mockP1 = jest.fn((RpcServerBase.prototype as any).process);
        (server2.getComponent(StatefulRpcServer) as any).process = mockP1;
        const mockP2 = jest.fn((RpcServerBase.prototype as any).process);
        (server3.getComponent(StatefulRpcServer) as any).process = mockP2;
        await expect(client.getService(root.Greeter).to(id2).sayHello({ name: 'world' })).resolves.toEqual({
            message: 'Hello, world',
        });
        expect(mockP1).toBeCalledTimes(1);
        expect(mockP2).not.toBeCalled();
    });

    test('rpc publish', () => {
        const client = server.getComponent(RpcClient);
        if (!client) return;
        const nats = server.getComponent(NatsComponent)?.nc;
        if (!nats) return;
        const mockPub = jest.spyOn(nats, 'publish');
        const mockReq = jest.spyOn(nats, 'request');
        const mockCallRpc = jest.spyOn(rpcUtils, 'callRpc');
        client.getService(root.Greeter).bar({});
        expect(mockPub).toBeCalledTimes(1);
        expect(mockReq).not.toBeCalled();
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(mockCallRpc).toBeCalledTimes(1);
                expect(mockCallRpc.mock.results[0].value).resolves.toEqual({});
                resolve();
            }, 100);
        });
    });

    test('rpc fail', async () => {
        const client = server.getComponent(RpcClient);
        if (!client) return;
        const nats = server.getComponent(NatsComponent);
        if (!nats) return;
        jest.spyOn(nats, 'tryRequest').mockRejectedValue(new Error('timeout'));
        await expect(client.getService(root.Greeter).to(id2).sayHello({ name: 'world' })).rejects.toThrow('timeout');
    });
});
