import type { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase';
import type { Root } from 'protobufjs';
/**
 * listen for rpc events
 * don't store any state in the server
 */
export declare abstract class RpcServerBase extends SubscriberBase {
    protoRoot: Root | undefined;
    protected process(msg: Msg): void;
}
