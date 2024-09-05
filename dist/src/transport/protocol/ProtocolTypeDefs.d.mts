/// <reference types="node" resolution-mode="require"/>
import type { SocketClient } from '../SocketClient.mjs';
import { MsgType } from './MsgProcessor.mjs';
export interface Message {
    msg: {
        readonly id: number;
        readonly type: MsgType;
        readonly protoId: number;
        readonly body: Buffer;
    };
    client: SocketClient<unknown>;
}
