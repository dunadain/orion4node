"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.netConfig = void 0;
class NetConfig {
    heartbeatInterval = 20000; // miliseconds
    heartbeatTimeout = this.heartbeatInterval * 2; // miliseconds
}
exports.netConfig = new NetConfig();
