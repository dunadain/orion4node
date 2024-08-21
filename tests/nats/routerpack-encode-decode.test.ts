import { describe, expect, test } from '@jest/globals';
import { decodeRouterPack, encodeRouterPack } from '../../src/router/RouterUtils';
import { Context } from '../../src';

describe('test router pack encode decode', () => {
    test('data should not change after encode and decode', () => {
        const session: Context = {
            clientId: 2343,
            uid: '@#$kl4h23$#S',
            sId: 33,
            reqId: 234,
            protoId: 23,
        };
        const str = 'JSON.stringify(obj)23kj2@#$@#WDFka,,,.sdjflj23rj2ourlal;hwer2u3oiulawjrhawklekfjaskdf';
        const buf = encodeRouterPack(session, Buffer.from(str));
        const decoded = decodeRouterPack(buf);
        expect(decoded.body).not.toBe(undefined);
        if (decoded.body.length > 0) expect(str).toBe(decoded.body.toString());
        for (const k in session) {
            expect((session as any)[k]).toBe((decoded.context as any)[k]);
        }
    });

    test('when data is empty', () => {
        const session: Context = {
            clientId: 2343,
            uid: '@#$kl4h23$#S',
            sId: 33,
            reqId: 234,
            protoId: 23,
        };
        const buf = encodeRouterPack(session);
        const decoded = decodeRouterPack(buf);
        for (const k in session) {
            expect((session as any)[k]).toBe((decoded.context as any)[k]);
        }
        expect(decoded.body.length).toBe(0);
    });
});
