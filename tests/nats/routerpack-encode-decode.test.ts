import { describe, expect, test } from '@jest/globals';
import { decodeRouterPack, encodeRouterPack } from '../../src/router/RouterUtils';

describe('test router pack encode decode', () => {
    test('data should not change after encode and decode', () => {
        const session: Record<string, any> = {
            id: 2343,
            uid: '@#$kl4h23$#S',
            sid: 'SD4348%@#$5',
        };
        const str = 'JSON.stringify(obj)23kj2@#$@#WDFka,,,.sdjflj23rj2ourlal;hwer2u3oiulawjrhawklekfjaskdf';
        const buf = encodeRouterPack(session, Buffer.from(str));
        const decoded = decodeRouterPack(buf);
        expect(decoded.body).not.toBe(undefined);
        if (decoded.body) expect(str).toBe(decoded.body.toString());
        for (const k in session) {
            expect(session[k]).toBe((decoded.session as any)[k]);
        }
    });

    test('when data is empty', () => {
        const session: Record<string, any> = {
            id: 2343,
            uid: '@#$kl4h23$#S',
            sid: 'SD4348%@#$5',
        };
        const buf = encodeRouterPack(session);
        const decoded = decodeRouterPack(buf);
        for (const k in session) {
            expect(session[k]).toBe((decoded.session as any)[k]);
        }
        expect(decoded.body).toBe(undefined);
    });
});
