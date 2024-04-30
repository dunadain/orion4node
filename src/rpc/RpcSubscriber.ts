import { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase';
import { callRpc } from './RpcUtils';
import { logErr, logger } from '../logger/Logger';
import { Root } from 'protobufjs';

/**
 * listen for rpc events
 * don't store any state in the server
 */
export abstract class RpcSubscriber extends SubscriberBase {
    protoPath = '';
    private protoRoot: Root | undefined;
    async init() {
        this.protoRoot = (await import(this.protoPath)) as Root;
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
        callRpc(methodKey, decoded)
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
