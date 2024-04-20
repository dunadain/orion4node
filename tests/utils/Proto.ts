import { protocolIds } from '../../src/router/ProtocolMgr';

@protocolIds
export class Proto {
    static readonly GameLogin = 1000;
    static readonly GameUpdate = 1001;
    static readonly ChatSend = 1002;
}
