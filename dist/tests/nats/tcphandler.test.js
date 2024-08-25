"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const net = require("net");
const src_1 = require("../../src");
const testUtils_1 = require("../utils/testUtils");
const Proto_1 = require("../utils/Proto");
const routerUtils = require("../../src/router/RouterUtils");
const utils_1 = require("../../src/transport/protocol/utils");
const data = {
    a: 1,
    b: '223d',
    c: true,
    dsldksdjfk: '$$####asfdjal',
};
let server2;
const id2 = 2;
(0, globals_1.beforeAll)(async () => {
    server2 = new src_1.Server('game', id2);
    server2.addComponent(src_1.NatsComponent);
    server2.addComponent(src_1.StatelessHandlerSubscriber);
    server2.addComponent(src_1.StatefulHandlerSubscriber);
    server2.addComponent(src_1.FileLoader);
    server2.addComponent(src_1.PushSender);
    try {
        await server2.start();
    }
    catch (reason) {
        console.error(reason);
    }
});
(0, globals_1.afterAll)(() => {
    server2.shutdown();
});
(0, globals_1.describe)('tcp communication', () => {
    let client;
    (0, globals_1.beforeAll)(async () => {
        client = await (0, testUtils_1.createTcpConnection)(9001, '127.0.0.1');
    });
    (0, globals_1.afterAll)(() => {
        client.end();
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)('should send and receive data', async () => {
        const mockP = globals_1.jest.spyOn(src_1.StatelessHandlerSubscriber.prototype, 'process');
        const mockHandler = globals_1.jest.spyOn(routerUtils, 'handle');
        const reqId = 32;
        const result = await testReq(client, reqId);
        (0, globals_1.expect)(result.id).toBe(reqId);
        (0, globals_1.expect)(result.body.name).toBe('Hello Game');
        (0, globals_1.expect)(mockP).toBeCalledTimes(1);
        (0, globals_1.expect)(mockHandler).toBeCalledTimes(1);
    });
});
(0, globals_1.describe)('report error', () => {
    (0, globals_1.it)('should report handshake error', async () => {
        const [errCode, errMsg] = await new Promise((resolve) => {
            const client = net.createConnection({ port: 9001, host: '127.0.0.1' }, () => {
                const uidBuf = Buffer.from('myuuid');
                const buf = Buffer.alloc(1 + uidBuf.length);
                let offset = 0;
                buf.writeUInt8(uidBuf.length, offset++);
                (0, utils_1.copyArray)(buf, offset, uidBuf, 0, uidBuf.length);
                offset += uidBuf.length;
                const handshakePact = src_1.packUtils.encode(src_1.packUtils.PackType.HANDSHAKE, buf);
                client.write(handshakePact);
            });
            client.on('data', (buffer) => {
                const pkgs = src_1.packUtils.decode(buffer);
                const pkg = pkgs[0];
                if (pkg.type === src_1.packUtils.PackType.ERROR) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errCode = pkg.body.readUint16BE(0);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errMsg = pkg.body.subarray(2).toString();
                    resolve([errCode, errMsg]);
                }
            });
        });
        (0, globals_1.expect)(errCode).toBe(src_1.ErrorCode.InvaildHandShakeInfo);
        (0, globals_1.expect)(errMsg).toBe('invalid handshake');
    });
    (0, globals_1.it)('should report empty error', async () => {
        const [errCode, errMsg] = await new Promise((resolve) => {
            const client = net.createConnection({ port: 9001, host: '127.0.0.1' }, () => {
                const uidBuf = Buffer.from('');
                const buf = Buffer.alloc(5 + uidBuf.length);
                let offset = 0;
                buf.writeUInt8(uidBuf.length, offset++);
                (0, utils_1.copyArray)(buf, offset, uidBuf, 0, uidBuf.length);
                offset += uidBuf.length;
                buf.writeUint32BE(1, offset++);
                const handshakePact = src_1.packUtils.encode(src_1.packUtils.PackType.HANDSHAKE, buf);
                client.write(handshakePact);
            });
            client.on('data', (buffer) => {
                const pkgs = src_1.packUtils.decode(buffer);
                const pkg = pkgs[0];
                if (pkg.type === src_1.packUtils.PackType.ERROR) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errCode = pkg.body.readUint16BE(0);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const errMsg = pkg.body.subarray(2).toString();
                    resolve([errCode, errMsg]);
                }
            });
        });
        (0, globals_1.expect)(errCode).toBe(src_1.ErrorCode.InvalidUID);
        (0, globals_1.expect)(errMsg).toBe('empty uid');
    });
});
async function testReq(socket, reqId) {
    const encodedMsg = src_1.msgUtils.encode(reqId, src_1.msgUtils.MsgType.REQUEST, Proto_1.Proto.GameLogin, Buffer.from(JSON.stringify(data), 'utf8'));
    const result = await new Promise((resolve) => {
        socket.removeAllListeners('data');
        socket.on('data', (buffer) => {
            resolve((0, testUtils_1.decodeClientData)(buffer));
        });
        const pkg = src_1.packUtils.encode(src_1.packUtils.PackType.DATA, encodedMsg);
        socket.write(pkg);
    });
    return result;
}
