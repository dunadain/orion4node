import { NatsConnection } from 'nats';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { encodeRouterPack } from './RouterUtils';
import { protoMgr } from './ProtocolMgr';

export class PushSender extends Component {
    private _nc: NatsConnection | undefined;
    send(
        context: {
            id: number; // clientId
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
