import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import { Server } from '../../src/server/Server';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { RpcClient } from '../../src/rpc/RpcClient';
import { StatelessRpcSubscriber } from '../../src/rpc/StatelessRpcSubscriber';
import { FileLoader } from '../../src/server/FileLoader';
import { StatefulRpcSubscriber } from '../../src/rpc/StatefulRpcSubscriber';
import * as root from './proto/compiled';
import type { Root } from 'protobufjs';
import { RpcSubscriber } from '../../src/rpc/RpcSubscriber';
import * as path from 'node:path';
import * as rpc from '../../src/rpc/RpcUtils';

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
	client.addServices(root as unknown as Root, 'game');

	const protoPath = path.join(__dirname, 'proto', 'compiled');
	server2 = new Server('game', id2);
	server2.addComponent(NatsComponent);
	let rpcSub = server2.addComponent(StatelessRpcSubscriber);
	rpcSub.protoPath = protoPath;
	rpcSub = server2.addComponent(StatefulRpcSubscriber);
	rpcSub.protoPath = protoPath;
	server2.addComponent(FileLoader);

	server3 = new Server('game', id3);
	server3.addComponent(NatsComponent);
	rpcSub = server3.addComponent(StatelessRpcSubscriber);
	rpcSub.protoPath = protoPath;
	rpcSub = server3.addComponent(StatefulRpcSubscriber);
	rpcSub.protoPath = protoPath;
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

describe('rpc tests', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	test('stateless rpc call', async () => {
		const client = server.getComponent(RpcClient);
		if (!client) return;
		const mockP = jest.spyOn(RpcSubscriber.prototype as any, 'process');
		await expect(
			client.getService(root.Greeter).sayHello({ name: 'world' }),
		).resolves.toEqual({
			message: 'Hello, world',
		});
		expect(mockP).toBeCalledTimes(1);
		await expect(
			client.getService(root.Greeter).sayHello({ name: 'world' }),
		).resolves.toEqual({
			message: 'Hello, world',
		});
		expect(mockP).toBeCalledTimes(2);
	});

	test('stateful rpc call', async () => {
		const client = server.getComponent(RpcClient);
		if (!client) return;
		const mockP1 = jest.fn((RpcSubscriber.prototype as any).process);
		(server2.getComponent(StatefulRpcSubscriber) as any).process = mockP1;
		const mockP2 = jest.fn((RpcSubscriber.prototype as any).process);
		(server3.getComponent(StatefulRpcSubscriber) as any).process = mockP2;
		await expect(
			client.getService(root.Greeter).to(id2).sayHello({ name: 'world' }),
		).resolves.toEqual({
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
		const mockCallRpc = jest.spyOn(rpc, 'callRpc');
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
		await expect(
			client.getService(root.Greeter).to(id2).sayHello({ name: 'world' }),
		).rejects.toThrow('timeout');
	});
});
