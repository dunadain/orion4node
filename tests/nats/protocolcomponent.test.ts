import { describe, expect, test } from '@jest/globals';
import { protoMgr } from '../../src/router/ProtocolMgr';

describe('subject creation', () => {
    test('subject should have the form servertype.protocolid', () => {
        enum Proto {
            GameLogin,
            ChatSend,
        }

        protoMgr.setProtocol(Proto);
        expect(protoMgr.getSubject(Proto.GameLogin)).toBe('game.0');
        expect(protoMgr.getSubject(Proto.ChatSend)).toBe('chat.1');
    });
});
