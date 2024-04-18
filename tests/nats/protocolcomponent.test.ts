import { describe, expect, test } from '@jest/globals';
import { ProtocolMgr } from '../../src/router/ProtocolMgr';
import { Server } from '../../src/server/Server';

describe('subject creation', () => {
    test('subject should have the form servertype.protocolid', () => {
        const protoComp = new ProtocolMgr({} as Server);
        enum Proto {
            GameLogin,
            ChatSend,
        }

        protoComp.setProtocol(Proto);
        expect(protoComp.getSubject(Proto.GameLogin)).toBe('game.0');
        expect(protoComp.getSubject(Proto.ChatSend)).toBe('chat.1');
    });
});
