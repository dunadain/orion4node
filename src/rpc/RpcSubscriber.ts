import { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase';
import { callRpc } from './RpcUtils';
import { logger } from '../logger/Logger';
import { Root } from 'protobufjs';

/**
 * listen for rpc events
 * don't store any state in the server
 */
export class RpcSubscriber extends SubscriberBase {
    protoPath = '';
    private protoRoot: Root | undefined;
    async init() {
        this.protoRoot = (await import(this.protoPath)) as Root;
    }

    protected process(msg: Msg) {
        const subject = msg.subject;
        const arr = subject.split('.');
        const responseKey = arr[arr.length - 1];
        const requestKey = arr[arr.length - 2];
        const methodKey = arr[arr.length - 4] + '.' + arr[arr.length - 3];
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
                logger.error(err);
            });
    }
}
