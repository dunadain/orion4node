import { protocolIds } from '../../src/router/ProtocolMgr';

@protocolIds
export class Proto {
    static readonly GameLogin = 1000;
    static readonly ChatSend = 1001;
}
