import { describe, expect, it } from '@jest/globals';
import * as pack from '../../src/transport/protocol/Package';
import * as message from '../../src/transport/protocol/Message';

describe('Package Protocol', () => {
    it('should be the same before encode and after decode', () => {
        const obj = {
            a: 1,
            b: '33',
            c: {
                e: 33,
                arr: ['1', '$', '##', '%%%']
            },
            d: [
                4, 5, 2, 1, 3, 5, 2, 5
            ]
        };
        let str = JSON.stringify(obj);
        let buffer = pack.encode(pack.PackType.DATA, Buffer.from(str, 'utf8'));
        let decodedData = pack.decode(buffer);
        expect(decodedData[0].type).toBe(pack.PackType.DATA);
        expect(decodedData[0].body?.toString()).toBe(str);

        const hbBuffer = pack.encode(pack.PackType.HEARTBEAT);
        expect(hbBuffer.length).toBe(4);
        const hbData = pack.decode(hbBuffer);
        expect(hbData[0].type).toBe(pack.PackType.HEARTBEAT);
        expect(hbData[0].body).toBeUndefined();

        const originalErr = { code: 500, msg: 'some error' };
        str = JSON.stringify(originalErr);
        buffer = pack.encode(pack.PackType.ERROR, Buffer.from(str));
        decodedData = pack.decode(buffer);
        expect(decodedData[0].type).toBe(pack.PackType.ERROR);
        expect(decodedData[0].body?.toString()).toBe(str);
        const errObj = JSON.parse(String(decodedData[0].body?.toString())) as { code: number, msg: string };
        expect(errObj.code).toBe(originalErr.code);
        expect(errObj.msg).toBe(originalErr.msg);
    });

    it('should not change data content through message encode and decode', () => {
        const obj = {
            a: 1,
            b: '33',
            c: {
                e: 33,
                arr: ['1', '$', '##', '%%%']
            },
            d: [
                4, 5, 2, 1, 3, 5, 2, 5
            ]
        };
        const str = JSON.stringify(obj);
        for (let i = 0; i < 4; ++i) {
            const type = i as message.MsgType;
            const id = type === message.MsgType.REQUEST || type === message.MsgType.RESPONSE ? Math.floor(Math.random() * 1000000) : 0;
            const route = type === message.MsgType.REQUEST || type === message.MsgType.NOTIFY ||
                type === message.MsgType.PUSH ? Math.floor(Math.random() * 63000) : 0;
            const buf = Buffer.from(str, 'utf8');
            const compressGzip = false;
            const encodedBuf = message.encode(id, type, route, buf, compressGzip);
            const decoded = message.decode(encodedBuf);
            expect(decoded.id).toBe(id);
            expect(decoded.type).toBe(type);
            expect(decoded.route).toBe(route);
            expect(!!decoded.compressGzip).toBe(compressGzip);
            expect(decoded.body.toString()).toBe(str);
        }
    });

    it('should throw error when route is too big', () => {
        expect(() => {
            message.encode(111, message.MsgType.REQUEST, 100000, Buffer.from('sldkjfsfjd'), false);
        }).toThrowError();
    });
});