import { describe, expect, it, test } from '@jest/globals';
import { protoMgr, protocolIds } from '../../src/router/ProtocolMgr';

describe('subject creation', () => {
    test('subject should have the form handler.servertype', () => {
        @protocolIds
        class Proto {
            static readonly GameLogin = 0;
            static readonly ChatSend = 1;
        }

        expect(protoMgr.getHandlerSubject(Proto.GameLogin, '')).toBe('handler.game');
        expect(protoMgr.getHandlerSubject(Proto.ChatSend, '')).toBe('handler.chat');
    });
    it('should throw error if protocol id is duplicated', () => {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            protocolIds({ GameLogin2: 0 });
        }).toThrowError('protocol id:0 is duplicated!');
    });
});
