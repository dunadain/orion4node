"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientState = void 0;
var ClientState;
(function (ClientState) {
    ClientState[ClientState["Default"] = 0] = "Default";
    ClientState[ClientState["WaitForAck"] = 1] = "WaitForAck";
    ClientState[ClientState["Ready"] = 2] = "Ready";
    ClientState[ClientState["Closed"] = 3] = "Closed";
})(ClientState || (exports.ClientState = ClientState = {}));
