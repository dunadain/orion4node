import type { Msg, Subscription, SubscriptionOptions } from 'nats';
import { Component } from '../../component/Component.mjs';
export declare abstract class SubscriberBase extends Component {
    protected subject: string;
    protected sub: Subscription | undefined;
    protected opt: SubscriptionOptions | undefined;
    start(): Promise<void>;
    private waitForMsgs;
    protected abstract process(msg: Msg): unknown;
    dispose(): Promise<void>;
}
