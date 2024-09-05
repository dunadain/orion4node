import type { Msg } from 'nats';
import { SubscriberBase } from './SubscriberBase.mjs';
export declare abstract class RouteSubscriber extends SubscriberBase {
    protected process(msg: Msg): void;
}
