import { describe, expect, it, test } from '@jest/globals';
import { ProtocolMgr, protocolIds } from '../../src/router/ProtocolMgr';
import { Server } from '../../src/server/Server';

describe('subject creation', () => {
    test('subject should have the form handler.servertype', async () => {
        @protocolIds
        class Proto {
            static readonly GameLogin = 0;
            static readonly ChatSend = 1;
        }
        const protoMgr = new ProtocolMgr({} as Server);
        expect(await protoMgr.getHandlerSubject(Proto.GameLogin, '')).toBe('handler.game');
        expect(await protoMgr.getHandlerSubject(Proto.ChatSend, '')).toBe('handler.chat');
    });
    it('should throw error if protocol id is duplicated', () => {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            protocolIds({ GameLogin2: 0 });
        }).toThrowError('protocol id:0 is duplicated!');
    });
});
