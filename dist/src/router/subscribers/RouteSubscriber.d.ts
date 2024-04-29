import { Msg } from 'nats';
import { SubscriberBase } from './SubscriberBase';
export declare abstract class RouteSubscriber extends SubscriberBase {
    protected process(msg: Msg): void;
}
