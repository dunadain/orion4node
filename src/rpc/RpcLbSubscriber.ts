import { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase';

/**
 * listen for rpc events
 * don't store any state in the server
 */
export class RpcLbSubscriber extends SubscriberBase {
    async init() {
        this.subject = `rpc.${this.server.serverType}.*`; // example: rpc.game.{remotehandler}.method,  rpc.{uuid}
        this.opt = { queue: this.server.serverType };
    }

    protected process(msg: Msg) {
        if (!require.main) return;
        const buffer = Buffer.from(msg.data);
    }
}
