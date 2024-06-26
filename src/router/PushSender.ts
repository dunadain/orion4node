import { NatsConnection } from 'nats';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { encodeRouterPack } from './RouterUtils';
import { protoMgr } from './ProtocolMgr';

export class PushSender extends Component {
    private _nc: NatsConnection | undefined;

    /**
     * Sends a push message.
     *
     * @param context - The context object containing the following fields:
     *   - id: The client ID.
     *   - protoId: The protocol ID.
     *   - sId: The server ID.
     * @param msg - The message to be sent.
     */
    send(
        context: {
            id: number;
            protoId: number;
            sId: string;
        },
        msg: unknown
    ) {
        const buf = encodeRouterPack(context, msg ? protoMgr.encodeMsgBody(msg, context.protoId) : undefined);
        this.nc.publish(`push.${context.sId}`, buf);
    }

    get nc() {
        if (!this._nc) {
            this._nc = this.getComponent(NatsComponent)?.nc;
            if (!this._nc) throw new Error('NatsComponent is required!');
        }
        return this._nc;
    }
}
