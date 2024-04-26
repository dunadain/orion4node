import { describe, expect, it, test } from '@jest/globals';
import { FileLoader } from '../../src/server/FileLoader';
import { Server } from '../../src/server/Server';
import * as path from 'node:path';
import { handle } from '../../src/router/RouterUtils';
import { Proto } from '../utils/Proto';
import { callRpc } from '../../src/rpc/RpcUtils';

describe('load handlers and rpc', () => {
    it('should not throw err', async () => {
        const fileLoader = new FileLoader({} as Server);
        await expect(fileLoader.init()).resolves.toBeUndefined();
    });

    test('import loaded module', async () => {
        await expect(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
        const m = await import(path.join(__dirname, 'handler', 'TestHandler'));
        expect(m.TestHandler.prototype.handle).not.toBeUndefined();
    });

    it('should have handlers in RouteUtils', async () => {
        await expect(handle({ id: 1, protoId: Proto.GameLogin }, undefined, {} as Server)).resolves.toBe(1000);
    });

    it('should not reject to error when calling rpc', async () => {
        await expect(callRpc('Greeter.sayHello', { name: 'world' })).resolves.toEqual({ message: 'Hello, world' });
    });
});
