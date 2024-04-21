import { describe, expect, test } from '@jest/globals';
import { protoMgr, protocolIds } from '../../src/router/ProtocolMgr';

describe('subject creation', () => {
    test('subject should have the form servertype.protocolid', () => {
        @protocolIds
        class Proto {
            static readonly GameLogin = 0;
            static readonly ChatSend = 1;
        }

        expect(protoMgr.getSubject(Proto.GameLogin)).toBe('game.handler');
        expect(protoMgr.getSubject(Proto.ChatSend)).toBe('chat.handler');
    });
});
