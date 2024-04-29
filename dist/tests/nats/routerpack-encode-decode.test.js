"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const RouterUtils_1 = require("../../src/router/RouterUtils");
(0, globals_1.describe)('test router pack encode decode', () => {
    (0, globals_1.test)('data should not change after encode and decode', () => {
        const session = {
            id: 2343,
            uid: '@#$kl4h23$#S',
            sid: 'SD4348%@#$5',
        };
        const str = 'JSON.stringify(obj)23kj2@#$@#WDFka,,,.sdjflj23rj2ourlal;hwer2u3oiulawjrhawklekfjaskdf';
        const buf = (0, RouterUtils_1.encodeRouterPack)(session, Buffer.from(str));
        const decoded = (0, RouterUtils_1.decodeRouterPack)(buf);
        (0, globals_1.expect)(decoded.body).not.toBe(undefined);
        if (decoded.body)
            (0, globals_1.expect)(str).toBe(decoded.body.toString());
        for (const k in session) {
            (0, globals_1.expect)(session[k]).toBe(decoded.context[k]);
        }
    });
    (0, globals_1.test)('when data is empty', () => {
        const session = {
            id: 2343,
            uid: '@#$kl4h23$#S',
            sid: 'SD4348%@#$5',
        };
        const buf = (0, RouterUtils_1.encodeRouterPack)(session);
        const decoded = (0, RouterUtils_1.decodeRouterPack)(buf);
        for (const k in session) {
            (0, globals_1.expect)(session[k]).toBe(decoded.context[k]);
        }
        (0, globals_1.expect)(decoded.body).toBe(undefined);
    });
});
