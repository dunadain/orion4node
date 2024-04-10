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
        const str = JSON.stringify(obj);
        const buffer = pack.encode(pack.PackType.DATA, Buffer.from(str, 'utf8'));
        const data = pack.decode(buffer);
        expect(data[0].type).toBe(pack.PackType.DATA);
        expect(data[0].body?.toString()).toBe(str);
        const hbBuffer = pack.encode(pack.PackType.HEARTBEAT);
        expect(hbBuffer.length).toBe(4);
        const hbData = pack.decode(hbBuffer);
        expect(hbData[0].type).toBe(pack.PackType.HEARTBEAT);
        expect(hbData[0].body).toBeUndefined();
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
});