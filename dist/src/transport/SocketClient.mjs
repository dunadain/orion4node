import { ErrorCode } from '../config/ErrorCode.mjs';
import { MsgType } from './protocol/MsgProcessor.mjs';
export var ClientState;
(function (ClientState) {
    ClientState[ClientState["Default"] = 0] = "Default";
    ClientState[ClientState["WaitForAck"] = 1] = "WaitForAck";
    ClientState[ClientState["Ready"] = 2] = "Ready";
    ClientState[ClientState["Closed"] = 3] = "Closed";
})(ClientState || (ClientState = {}));
