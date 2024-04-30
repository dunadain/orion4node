"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const FileLoader_1 = require("../../src/server/FileLoader");
const path = require("node:path");
const RouterUtils_1 = require("../../src/router/RouterUtils");
const Proto_1 = require("../utils/Proto");
const RpcUtils_1 = require("../../src/rpc/RpcUtils");
(0, globals_1.describe)('load handlers and rpc', () => {
    (0, globals_1.it)('should not throw err', async () => {
        const fileLoader = new FileLoader_1.FileLoader({});
        await (0, globals_1.expect)(fileLoader.init()).resolves.toBeUndefined();
    });
    (0, globals_1.test)('import loaded module', async () => {
        await (0, globals_1.expect)(Promise.resolve(`${path.join(__dirname, 'handler', 'TestHandler')}`).then(s => require(s))).resolves.not.toBeUndefined();
        const m = await Promise.resolve(`${path.join(__dirname, 'handler', 'TestHandler')}`).then(s => require(s));
        (0, globals_1.expect)(m.TestHandler.prototype.handle).not.toBeUndefined();
    });
    (0, globals_1.it)('should have handlers in RouteUtils', async () => {
        await (0, globals_1.expect)((0, RouterUtils_1.handle)({ id: 1, protoId: Proto_1.Proto.GameLogin }, undefined, {})).resolves.toBe(1000);
    });
    (0, globals_1.it)('should not reject to error when calling rpc', async () => {
        await (0, globals_1.expect)((0, RpcUtils_1.callRpc)('Greeter.sayHello', { name: 'world' })).resolves.toEqual({ message: 'Hello, world' });
        await (0, globals_1.expect)((0, RpcUtils_1.callRpc)('Greeter.speak', { name: 'world' })).rejects.toThrowError();
    });
});
