"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulRpcSubscriber = void 0;
const RpcSubscriber_1 = require("./RpcSubscriber");
/**
 * StatefulRpcSubscriber use unique uuid to listen for rpc events
 */
class StatefulRpcSubscriber extends RpcSubscriber_1.RpcSubscriber {
    async init() {
        this.subject = `rpc.${this.server.uuid.toString()}.>`; // example: rpc.{uuid}.{remotehandler}.method.request.response
    }
}
exports.StatefulRpcSubscriber = StatefulRpcSubscriber;
