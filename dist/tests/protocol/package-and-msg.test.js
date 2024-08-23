"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const pack = require("../../src/transport/protocol/PacketProcessor");
const message = require("../../src/transport/protocol/MsgProcessor");
(0, globals_1.describe)('Package Protocol', () => {
    (0, globals_1.it)('should be the same before encode and after decode', () => {
        const obj = {
            a: 1,
            b: '33',
            c: {
                e: 33,
                arr: ['1', '$', '##', '%%%'],
            },
            d: [4, 5, 2, 1, 3, 5, 2, 5],
        };
        let str = JSON.stringify(obj);
        let buffer = pack.encode(pack.PackType.DATA, Buffer.from(str, 'utf8'));
        let decodedData = pack.decode(buffer);
        (0, globals_1.expect)(decodedData[0].type).toBe(pack.PackType.DATA);
        (0, globals_1.expect)(decodedData[0].body?.toString()).toBe(str);
        const hbBuffer = pack.encode(pack.PackType.HEARTBEAT);
        (0, globals_1.expect)(hbBuffer.length).toBe(4);
        const hbData = pack.decode(hbBuffer);
        (0, globals_1.expect)(hbData[0].type).toBe(pack.PackType.HEARTBEAT);
        (0, globals_1.expect)(hbData[0].body).toBeUndefined();
        const originalErr = { code: 500, msg: 'some error' };
        str = JSON.stringify(originalErr);
        buffer = pack.encode(pack.PackType.ERROR, Buffer.from(str));
        decodedData = pack.decode(buffer);
        (0, globals_1.expect)(decodedData[0].type).toBe(pack.PackType.ERROR);
        (0, globals_1.expect)(decodedData[0].body?.toString()).toBe(str);
        const errObj = JSON.parse(String(decodedData[0].body?.toString()));
        (0, globals_1.expect)(errObj.code).toBe(originalErr.code);
        (0, globals_1.expect)(errObj.msg).toBe(originalErr.msg);
    });
    (0, globals_1.it)('should not change data content through message encode and decode', () => {
        const obj = {
            a: 1,
            b: '33',
            c: {
                e: 33,
                arr: ['1', '$', '##', '%%%'],
            },
            d: [4, 5, 2, 1, 3, 5, 2, 5],
        };
        const str = JSON.stringify(obj);
        for (let i = 0; i < 4; ++i) {
            const type = i;
            const id = type === message.MsgType.REQUEST || type === message.MsgType.RESPONSE
                ? Math.floor(Math.random() * 0xff)
                : 0;
            const route = type === message.MsgType.REQUEST || type === message.MsgType.NOTIFY || type === message.MsgType.PUSH
                ? Math.floor(Math.random() * 0xffff)
                : 0;
            const buf = Buffer.from(str, 'utf8');
            // const compressGzip = false;
            const encodedBuf = message.encode(id, type, route, buf);
            const decoded = message.decode(encodedBuf);
            (0, globals_1.expect)(decoded.id).toBe(id);
            (0, globals_1.expect)(decoded.type).toBe(type);
            (0, globals_1.expect)(decoded.route).toBe(route);
            // expect(!!decoded.compressGzip).toBe(compressGzip);
            (0, globals_1.expect)(decoded.body.toString()).toBe(str);
        }
    });
    (0, globals_1.it)('should throw error when route is too big', () => {
        (0, globals_1.expect)(() => {
            message.encode(111, message.MsgType.REQUEST, 100000, Buffer.from('sldkjfsfjd'));
        }).toThrowError();
    });
});
