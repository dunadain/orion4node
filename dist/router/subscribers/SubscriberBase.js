"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberBase = void 0;
const Component_1 = require("../../component/Component");
const NatsComponent_1 = require("../../nats/NatsComponent");
const Logger_1 = require("../../logger/Logger");
class SubscriberBase extends Component_1.Component {
    subject = '';
    sub;
    opt;
    async start() {
        const nc = this.getComponent(NatsComponent_1.NatsComponent)?.nc;
        this.sub = nc?.subscribe(this.subject, this.opt);
        this.waitForMsgs().catch((e) => {
            (0, Logger_1.logErr)(e);
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
exports.SubscriberBase = SubscriberBase;
