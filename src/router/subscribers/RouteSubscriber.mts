import type { Msg } from 'nats';
import { logErr } from '../../logger/Logger.mjs';
import { decodeRouterPack, encodeRouterPack, routerUtils } from '../RouterUtils.mjs';
import { SubscriberBase } from './SubscriberBase.mjs';
import { protoMgr } from '../ProtocolMgr.mjs';

export abstract class RouteSubscriber extends SubscriberBase {
    protected process(msg: Msg) {
        const data = decodeRouterPack(Buffer.from(msg.data));
        routerUtils
            .handle(
                data.context,
                data.body.length > 0 ? protoMgr.decodeMsgBody(data.body, data.context.protoId) : undefined,
                this.server
            )
            .then((result) => {
                if (msg.reply) {
                    msg.respond(
                        encodeRouterPack(
                            {
                                clientId: data.context.clientId,
                                protoId: data.context.protoId,
                                uid: '',
                                roleid: '',
                                sId: this.server.uuid,
                                reqId: data.context.reqId,
                            },
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
