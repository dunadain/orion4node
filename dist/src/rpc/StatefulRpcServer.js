"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulRpcServer = void 0;
const RpcServerBase_1 = require("./RpcServerBase");
/**
 * StatefulRpcServer use unique uuid to listen for rpc events
 */
class StatefulRpcServer extends RpcServerBase_1.RpcServerBase {
    async init() {
        this.subject = `rpc.${this.server.uuid.toString()}.>`; // example: rpc.{uuid}.{remotehandler}.method.request.response
    }
}
exports.StatefulRpcServer = StatefulRpcServer;
