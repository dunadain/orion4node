import { Msg } from 'nats';
import { SubscriberBase } from '../router/subscribers/SubscriberBase';
/**
 * listen for rpc events
 * don't store any state in the server
 */
export declare abstract class RpcSubscriber extends SubscriberBase {
    protoPath: string;
    private protoRoot;
    init(): Promise<void>;
    protected process(msg: Msg): void;
}
