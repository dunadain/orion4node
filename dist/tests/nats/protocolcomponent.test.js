"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const ProtocolMgr_1 = require("../../src/router/ProtocolMgr");
(0, globals_1.describe)('subject creation', () => {
    (0, globals_1.test)('subject should have the form handler.servertype', async () => {
        let Proto;
        (function (Proto) {
            Proto[Proto["GameLogin"] = 0] = "GameLogin";
            Proto[Proto["ChatSend"] = 1] = "ChatSend";
        })(Proto || (Proto = {}));
        (0, ProtocolMgr_1.register)(Proto);
        (0, globals_1.expect)(await ProtocolMgr_1.protoMgr.getHandlerSubject(Proto.GameLogin, '')).toBe('handler.game');
        (0, globals_1.expect)(await ProtocolMgr_1.protoMgr.getHandlerSubject(Proto.ChatSend, '')).toBe('handler.chat');
    });
    (0, globals_1.it)('should throw error if protocol id is duplicated', () => {
        (0, globals_1.expect)(() => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            (0, ProtocolMgr_1.register)({ GameLogin2: 0 });
        }).toThrowError('protocol id:0 is duplicated!');
    });
});
