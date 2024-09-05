import { register } from '../../src/index.mjs';

export enum Proto {
    GameLogin,
    GameUpdate,
    PushToClient,
    ChatSend,
}

register(Proto);
