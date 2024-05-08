import { register } from '../../src';

export enum Proto {
    GameLogin,
    GameUpdate,
    PushToClient,
    ChatSend,
}

register(Proto);
