"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteSubscriber = void 0;
const Logger_1 = require("../../logger/Logger");
const RouterUtils_1 = require("../RouterUtils");
const SubscriberBase_1 = require("./SubscriberBase");
const ProtocolMgr_1 = require("../ProtocolMgr");
class RouteSubscriber extends SubscriberBase_1.SubscriberBase {
    process(msg) {
        const data = (0, RouterUtils_1.decodeRouterPack)(Buffer.from(msg.data));
        (0, RouterUtils_1.handle)(data.context, data.body.length > 0 ? ProtocolMgr_1.protoMgr.decodeMsgBody(data.body, data.context.protoId) : undefined, this.server)
            .then((result) => {
            if (msg.reply) {
                msg.respond((0, RouterUtils_1.encodeRouterPack)({
                    clientId: data.context.clientId,
                    protoId: data.context.protoId,
                    uid: '',
                    sId: this.server.uuid,
                    reqId: data.context.reqId,
                }, result ? ProtocolMgr_1.protoMgr.encodeMsgBody(result, data.context.protoId) : undefined));
            }
        })
            .catch((e) => {
            (0, Logger_1.logErr)(e);
        });
    }
}
exports.RouteSubscriber = RouteSubscriber;
