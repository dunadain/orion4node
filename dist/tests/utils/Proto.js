"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proto = void 0;
const src_1 = require("../../src");
var Proto;
(function (Proto) {
    Proto[Proto["GameLogin"] = 0] = "GameLogin";
    Proto[Proto["GameUpdate"] = 1] = "GameUpdate";
    Proto[Proto["PushToClient"] = 2] = "PushToClient";
    Proto[Proto["ChatSend"] = 3] = "ChatSend";
})(Proto || (exports.Proto = Proto = {}));
(0, src_1.register)(Proto);
