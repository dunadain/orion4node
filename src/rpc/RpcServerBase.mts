import type { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase.mjs';
import { logErr, logger } from '../logger/Logger.mjs';
import type { Root } from 'protobufjs';
import { rpcUtils } from './RpcUtils.mjs';

/**
 * listen for rpc events
 * don't store any state in the server
 */
export abstract class RpcServerBase extends SubscriberBase {
    protoRoot: Root | undefined;
    setup(root: Root) {
        this.protoRoot = root;
    }

    protected process(msg: Msg) {
        const subject = msg.subject;
        let index = subject.lastIndexOf('{');
        let index2 = 0;
        const responseKey = subject.substring(index + 1, subject.length - 1);
        index2 = index;
        index = subject.lastIndexOf('{', index - 1);
        const requestKey = subject.substring(index + 1, index2 - 2);
        index2 = index;
        index = subject.lastIndexOf('.', index - 2);
        const methodName = subject.substring(index + 1, index2 - 1);
        index2 = index;
        index = subject.lastIndexOf('.', index - 1);
        const serviceKey = subject.substring(index + 1, index2);
        const methodKey = serviceKey + '.' + methodName.charAt(0).toLowerCase() + methodName.slice(1);
        if (!this.protoRoot) {
            logger.error('protoRoot not found');
            return;
        }
        const decoded = this.protoRoot.lookupType(requestKey).decode(msg.data);
        rpcUtils
            .callRpc(methodKey, decoded)
            .then((result) => {
                if (msg.reply) {
                    if (!this.protoRoot) return;
                    const structure = this.protoRoot.lookupType(responseKey);
                    const err = structure.verify(result as Record<string, unknown>);
                    if (err) return Promise.reject(new Error(err));
                    const protoMessage = structure.create(result as Record<string, unknown>);
                    msg.respond(structure.encode(protoMessage).finish());
                }
            })
            .catch((err: unknown) => {
                logErr(err);
            });
    }
}
