"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const ProtocolMgr_1 = require("../../src/router/ProtocolMgr");
(0, globals_1.describe)('subject creation', () => {
    (0, globals_1.test)('subject should have the form handler.servertype', async () => {
        let Proto = class Proto {
            static GameLogin = 0;
            static ChatSend = 1;
        };
        Proto = __decorate([
            ProtocolMgr_1.protocolIds
        ], Proto);
        (0, globals_1.expect)(await ProtocolMgr_1.protoMgr.getHandlerSubject(Proto.GameLogin, '')).toBe('handler.game');
        (0, globals_1.expect)(await ProtocolMgr_1.protoMgr.getHandlerSubject(Proto.ChatSend, '')).toBe('handler.chat');
    });
    (0, globals_1.it)('should throw error if protocol id is duplicated', () => {
        (0, globals_1.expect)(() => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            (0, ProtocolMgr_1.protocolIds)({ GameLogin2: 0 });
        }).toThrowError('protocol id:0 is duplicated!');
    });
});
