import { describe, expect, it } from '@jest/globals';
import { Server } from '../../src/server/Server.mjs';
import * as path from 'node:path';
import { handle } from '../../src/router/RouterUtils.mjs';
import { Proto } from '../utils/Proto.mjs';
import { callRpc } from '../../src/rpc/RpcUtils.mjs';
import { fileURLToPath } from 'node:url';
import { loadHandlersAndRemotes } from '../../src/index.mjs';

describe('load handlers and rpc', () => {
    it('should not throw err', async () => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        await expect(loadHandlersAndRemotes(__dirname)).resolves.toBeUndefined();

        await expect(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
        const m = await import(path.join(__dirname, 'handler', 'TestHandler'));
        expect(m.TestHandler.prototype.handle).not.toBeUndefined();

        await expect(callRpc('Greeter.sayHello', { name: 'world' })).resolves.toEqual({ message: 'Hello, world' });
        await expect(callRpc('Greeter.speak', { name: 'world' })).rejects.toThrowError();

        await expect(
            handle({ clientId: 1, protoId: Proto.GameLogin, reqId: 1, sId: 1, uid: '2k3' }, undefined, {} as Server)
        ).resolves.toBe(1000);
    });

    // test('import loaded module', async () => {
    //     const __filename = fileURLToPath(import.meta.url);
    //     const __dirname = path.dirname(__filename);
    //     await expect(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
    //     const m = await import(path.join(__dirname, 'handler', 'TestHandler'));
    //     expect(m.TestHandler.prototype.handle).not.toBeUndefined();
    // });

    // it('should have handlers in RouteUtils', async () => {
    //     await expect(
    //         handle({ clientId: 1, protoId: Proto.GameLogin, reqId: 1, sId: 1, uid: '2k3' }, undefined, {} as Server)
    //     ).resolves.toBe(1000);
    // });

    // it('should not reject to error when calling rpc', async () => {
    //     await expect(callRpc('Greeter.sayHello', { name: 'world' })).resolves.toEqual({ message: 'Hello, world' });
    //     await expect(callRpc('Greeter.speak', { name: 'world' })).rejects.toThrowError();
    // });
});
