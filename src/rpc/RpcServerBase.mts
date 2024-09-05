import type { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase.mjs';
import { logErr } from '../logger/Logger.mjs';
import { rpcUtils } from './RpcUtils.mjs';

/**
 * listen for rpc events
 * don't store any state in the server
 */
export abstract class RpcServerBase extends SubscriberBase {
    protected process(msg: Msg) {
        const subject = msg.subject;
        const secondDotIndex = subject.indexOf('.', subject.indexOf('.') + 1);
        const rpcProto = subject.substring(secondDotIndex + 1);

        rpcUtils
            .callRpc(rpcProto, msg.data)
            .then((result) => {
                if (msg.reply) {
                    msg.respond(result);
                }
            })
            .catch((err: unknown) => {
                logErr(err);
            });
    }
}
