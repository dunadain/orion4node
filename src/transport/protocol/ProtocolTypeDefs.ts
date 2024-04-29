import type { SocketClient } from '../SocketClient';
import { MsgType } from './MsgProcessor';

export interface Message {
    msg: {
        readonly id: number;
        readonly type: MsgType;
        readonly protoId: number;
        readonly body: Buffer;
    };
    client: SocketClient<unknown>;
}
