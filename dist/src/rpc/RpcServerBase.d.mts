import type { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase.mjs';
/**
 * listen for rpc events
 * don't store any state in the server
 */
export declare abstract class RpcServerBase extends SubscriberBase {
    protected process(msg: Msg): void;
}
