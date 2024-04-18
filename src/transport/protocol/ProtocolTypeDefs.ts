import { SocketClient } from '../SocketClient';
import { MsgType } from './MsgProcessor';

export interface Message {
    msg: {
        readonly id: number;
        readonly type: MsgType;
        readonly route: number;
        readonly body: Buffer;
    };
    client: SocketClient<unknown>;
}
