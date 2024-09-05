import { describe, expect, it } from '@jest/globals';
import { Server } from '../../src/server/Server.mjs';
import * as path from 'node:path';
import { Proto } from '../utils/Proto.mjs';
import { fileURLToPath } from 'node:url';
import { loadHandlersAndRemotes, routerUtils, rpcUtils } from '../../src/index.mjs';
import root from '../utils/protores/bundle.cjs';

describe('load handlers and rpc', () => {
    it('should not throw err', async () => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        await expect(loadHandlersAndRemotes(__dirname)).resolves.toBeUndefined();

        await expect(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
        const m = await import(path.join(__dirname, 'handler', 'TestHandler'));
        expect(m.TestHandler.prototype.handle).not.toBeUndefined();

        let msg = root.HelloRequest.create({ name: 'world' });
        let buf = root.HelloRequest.encode(msg).finish();
        await expect(
            rpcUtils.callRpc('Greeter.SayHello', buf).then((data) => {
                return root.HelloReply.decode(data);
            })
        ).resolves.toEqual({
            message: 'Hello, world',
        });
        await expect(rpcUtils.callRpc('Greeter.Speak', buf)).rejects.toThrowError();

        await expect(
            routerUtils.handle(
                { clientId: 1, protoId: Proto.GameLogin, reqId: 1, sId: 1, uid: '2k3' },
                undefined,
                {} as Server
            )
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
