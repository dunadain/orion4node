"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessRpcSubscriber = void 0;
const RpcSubscriber_1 = require("./RpcSubscriber");
class StatelessRpcSubscriber extends RpcSubscriber_1.RpcSubscriber {
    async init() {
        await super.init();
        this.subject = `rpc.${this.server.serverType}.>`; // example: rpc.{servertype}.{remotehandler}.method.request.response
        this.opt = { queue: this.server.serverType };
    }
}
exports.StatelessRpcSubscriber = StatelessRpcSubscriber;
