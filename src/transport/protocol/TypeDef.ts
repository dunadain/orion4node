import { MsgType } from './MsgProcessor';

export interface Message {
    id: number;
    type: MsgType;
    route: number;
    body: unknown;
}
