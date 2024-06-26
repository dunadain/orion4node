"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushSubscriber = void 0;
const RouterUtils_1 = require("../RouterUtils");
const ClientManager_1 = require("../../component/ClientManager");
const MsgProcessor_1 = require("../../transport/protocol/MsgProcessor");
const SubscriberBase_1 = require("./SubscriberBase");
/**
 * only exist on connector/gate servers to listen for push events
 * and send msgs to clients
 */
class PushSubscriber extends SubscriberBase_1.SubscriberBase {
    _clientMgr;
    async init() {
        this.subject = `push.${this.server.uuid}`;
    }
    process(msg) {
        const data = (0, RouterUtils_1.decodeRouterPack)(Buffer.from(msg.data));
        const client = this.clientMgr.getClientById(data.context.id);
        client?.sendMsg(MsgProcessor_1.MsgType.PUSH, data.context.protoId, data.body);
    }
    get clientMgr() {
        if (!this._clientMgr) {
            this._clientMgr = this.getComponent(ClientManager_1.ClientManager);
            if (!this._clientMgr)
                throw new Error('ClientManager Component is required!');
        }
        return this._clientMgr;
    }
}
exports.PushSubscriber = PushSubscriber;
