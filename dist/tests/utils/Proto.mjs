import { register } from '../../src/index.mjs';
export var Proto;
(function (Proto) {
    Proto[Proto["GameLogin"] = 0] = "GameLogin";
    Proto[Proto["GameUpdate"] = 1] = "GameUpdate";
    Proto[Proto["PushToClient"] = 2] = "PushToClient";
    Proto[Proto["ChatSend"] = 3] = "ChatSend";
})(Proto || (Proto = {}));
register(Proto);
