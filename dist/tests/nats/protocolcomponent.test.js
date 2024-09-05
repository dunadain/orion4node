import { describe, expect, it, test } from '@jest/globals';
import { protoMgr, register } from '../../src/router/ProtocolMgr.mjs';
describe('subject creation', () => {
    test('subject should have the form handler.servertype', async () => {
        let Proto;
        (function (Proto) {
            Proto[Proto["GameLogin"] = 0] = "GameLogin";
            Proto[Proto["ChatSend"] = 1] = "ChatSend";
        })(Proto || (Proto = {}));
        register(Proto);
        expect(await protoMgr.getHandlerSubject(Proto.GameLogin, '')).toBe('handler.game');
        expect(await protoMgr.getHandlerSubject(Proto.ChatSend, '')).toBe('handler.chat');
    });
    it('should throw error if protocol id is duplicated', () => {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            register({ GameLogin2: 0 });
        }).toThrowError('protocol id:0 is duplicated!');
    });
});
