"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushSender = void 0;
const Component_1 = require("../component/Component");
const NatsComponent_1 = require("../nats/NatsComponent");
const RouterUtils_1 = require("./RouterUtils");
const ProtocolMgr_1 = require("./ProtocolMgr");
class PushSender extends Component_1.Component {
    _nc;
    /**
     * Sends a push message.
     *
     * @param context - The context object containing the following fields:
     *   - id: The client ID.
     *   - protoId: The protocol ID.
     *   - sId: The server ID.
     * @param msg - The message to be sent.
     */
    send(context, msg) {
        const buf = (0, RouterUtils_1.encodeRouterPack)(context, msg ? ProtocolMgr_1.protoMgr.encodeMsgBody(msg, context.protoId) : undefined);
        this.nc.publish(`${context.sId.toString()}.push`, buf);
    }
    get nc() {
        if (!this._nc) {
            this._nc = this.getComponent(NatsComponent_1.NatsComponent)?.nc;
            if (!this._nc)
                throw new Error('NatsComponent is required!');
        }
        return this._nc;
    }
}
exports.PushSender = PushSender;
