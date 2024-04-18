import { describe, expect, test } from '@jest/globals';
import { decodeRouterBuf, encodeRouterBuf } from '../../src/router/RouterUtils';

describe('test router pack encode decode', () => {
    test('data should not change after encode and decode', () => {
        const obj = {
            a: 1,
            b: '52#342#%!',
            c: [1, 3, '3', '#'],
        };
        const session: Record<string, any> = {
            id: 2343,
            uid: '@#$kl4h23$#S',
            sid: 'SD4348%@#$5',
        };
        const str = JSON.stringify(obj);
        const buf = encodeRouterBuf(session, Buffer.from(str));
        const decoded = decodeRouterBuf(buf);
        expect(str).toBe(decoded.body.toString());
        for (const k in session) {
            expect(session[k]).toBe((decoded.session as any)[k]);
        }
    });
});
