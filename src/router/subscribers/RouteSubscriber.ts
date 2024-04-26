import { Msg } from 'nats';
import { logErr } from '../../logger/Logger';
import { decodeRouterPack, encodeRouterPack, handle } from '../RouterUtils';
import { SubscriberBase } from './SubscriberBase';
import { ProtocolMgr } from '../ProtocolMgr';

export abstract class RouteSubscriber extends SubscriberBase {
    private _protoMgr: ProtocolMgr | undefined;
    protected process(msg: Msg) {
        const data = decodeRouterPack(Buffer.from(msg.data));
        handle(
            data.context,
            data.body ? this.protoMgr.decodeMsgBody(data.body, data.context.protoId) : undefined,
            this.server
        )
            .then((result) => {
                if (msg.reply) {
                    msg.respond(
                        encodeRouterPack(
                            { id: data.context.id },
                            result ? this.protoMgr.encodeMsgBody(result, data.context.protoId) : undefined
                        )
                    );
                }
            })
            .catch((e: unknown) => {
                logErr(e);
            });
    }

    get protoMgr() {
        if (!this._protoMgr) {
            this._protoMgr = this.getComponent(ProtocolMgr);
            if (!this._protoMgr) throw new Error('ProtocolMgr is required!');
        }
        return this._protoMgr;
    }
}
