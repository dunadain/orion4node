import { Subscription } from 'nats';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { logErr } from '../logger/Logger';

export class PushSubscriber extends Component {
    private sub: Subscription | undefined;
    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;

        this.sub = nc?.subscribe(this.server.uuid, {
            callback: (err, msg) => {
                if (err) {
                    console.log('subscription error', err.message);
                    return;
                }
                if (msg.reply) {
                    msg.respond(`hello1`);
                }
            },
        });
    }

    dispose(): void {
        this.sub?.drain().catch((e: unknown) => {
            logErr(e);
        });
    }
}