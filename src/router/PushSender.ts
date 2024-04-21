import { NatsConnection } from 'nats';
import { Component } from '../component/Component';
import { Context } from './RouterTypeDef';
import { NatsComponent } from '../nats/NatsComponent';
import { encodeRouterPack } from './RouterUtils';
import { protoMgr } from './ProtocolMgr';

export class PushSender extends Component {
    private _nc: NatsConnection | undefined;
    send(context: Context, msg: unknown) {
        const buf = encodeRouterPack(
            { id: context.id },
            msg ? protoMgr.encodeMsgBody(msg, context.protoId) : undefined
        );
        if (context.sId === undefined)
            throw new Error(`proto id:${context.protoId.toString()} context.sId is required!`);
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
