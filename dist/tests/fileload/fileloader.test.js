"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const FileLoader_1 = require("../../src/server/FileLoader");
const path = __importStar(require("node:path"));
const RouterUtils_1 = require("../../src/router/RouterUtils");
const Proto_1 = require("../utils/Proto");
const RpcUtils_1 = require("../../src/rpc/RpcUtils");
(0, globals_1.describe)('load handlers and rpc', () => {
    (0, globals_1.it)('should not throw err', async () => {
        const fileLoader = new FileLoader_1.FileLoader({});
        await (0, globals_1.expect)(fileLoader.init()).resolves.toBeUndefined();
    });
    (0, globals_1.test)('import loaded module', async () => {
        await (0, globals_1.expect)(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
        const m = await import(path.join(__dirname, 'handler', 'TestHandler'));
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
