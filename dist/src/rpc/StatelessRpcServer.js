"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessRpcServer = void 0;
const RpcServerBase_1 = require("./RpcServerBase");
class StatelessRpcServer extends RpcServerBase_1.RpcServerBase {
    async init() {
        this.subject = `rpc.${this.server.serverType}.>`; // example: rpc.{servertype}.{remotehandler}.method.request.response
        this.opt = { queue: 'rpc.' + this.server.serverType };
    }
}
exports.StatelessRpcServer = StatelessRpcServer;
