import { Msg } from 'nats';
import { logErr } from '../../logger/Logger';
import { decodeRouterPack, encodeRouterPack, handle } from '../RouterUtils';
import { protoMgr } from '../ProtocolMgr';
import { SubscriberBase } from './SubscriberBase';

export class RouteSubscriber extends SubscriberBase {
    async init() {
        this.subject = `handler.${this.server.serverType}`;
        this.opt = { queue: this.server.serverType };
    }

    protected process(msg: Msg) {
        const data = decodeRouterPack(Buffer.from(msg.data));
        handle(
            data.context,
            data.body ? protoMgr.decodeMsgBody(data.body, data.context.protoId) : undefined,
            this.server
        )
            .then((result) => {
                if (msg.reply) {
                    msg.respond(
                        encodeRouterPack(
                            { id: data.context.id },
                            result ? protoMgr.encodeMsgBody(result, data.context.protoId) : undefined
                        )
                    );
                }
            })
            .catch((e: unknown) => {
                logErr(e);
            });
    }
}
