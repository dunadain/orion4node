import { Component } from '../../component/Component.mjs';
import { NatsComponent } from '../../nats/NatsComponent.mjs';
import { logErr } from '../../logger/Logger.mjs';
export class SubscriberBase extends Component {
    subject = '';
    sub;
    opt;
    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;
        this.sub = nc?.subscribe(this.subject, this.opt);
        this.waitForMsgs().catch((e) => {
            logErr(e);
        });
    }
    async waitForMsgs() {
        if (!this.sub)
            return;
        for await (const msg of this.sub) {
            this.process(msg);
        }
    }
    async dispose() {
        await this.sub?.drain();
    }
}
