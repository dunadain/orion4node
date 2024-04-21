import { describe, expect, it, test } from '@jest/globals';
import { protoMgr, protocolIds } from '../../src/router/ProtocolMgr';

describe('subject creation', () => {
    test('subject should have the form servertype.protocolid', () => {
        @protocolIds
        class Proto {
            static readonly GameLogin = 0;
            static readonly ChatSend = 1;
        }

        expect(protoMgr.getSubject(Proto.GameLogin)).toBe('handler.game');
        expect(protoMgr.getSubject(Proto.ChatSend)).toBe('handler.chat');
    });
    it('should throw error if protocol id is duplicated', () => {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            protocolIds({ GameLogin2: 0 });
        }).toThrowError('protocol id:0 is duplicated!');
    });
});
