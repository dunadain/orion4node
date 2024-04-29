import { Msg, Subscription, SubscriptionOptions } from 'nats';
import { Component } from '../../component/Component';
import { NatsComponent } from '../../nats/NatsComponent';
import { logErr } from '../../logger/Logger';

export abstract class SubscriberBase extends Component {
    protected subject = '';
    protected sub: Subscription | undefined;
    protected opt: SubscriptionOptions | undefined;

    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;
        this.sub = nc?.subscribe(this.subject, this.opt);
        this.waitForMsgs().catch((e: unknown) => {
            logErr(e);
        });
    }

    private async waitForMsgs() {
        if (!this.sub) return;
        for await (const msg of this.sub) {
            this.process(msg);
        }
    }

    protected abstract process(msg: Msg): unknown;

    async dispose() {
        await this.sub?.drain();
    }
}
