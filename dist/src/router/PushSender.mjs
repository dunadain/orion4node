import { Component } from '../component/Component.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';
import { encodeRouterPack } from './RouterUtils.mjs';
import { protoMgr } from './ProtocolMgr.mjs';
export class PushSender extends Component {
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
        const buf = encodeRouterPack(context, msg ? protoMgr.encodeMsgBody(msg, context.protoId) : undefined);
        this.nc.publish(`${context.sUuid.toString()}.push`, buf);
    }
    get nc() {
        if (!this._nc) {
            this._nc = this.getComponent(NatsComponent)?.nc;
            if (!this._nc)
                throw new Error('NatsComponent is required!');
        }
        return this._nc;
    }
}
