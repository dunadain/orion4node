import { Msg, Subscription } from 'nats';
import { NatsComponent } from '../nats/NatsComponent';
import { Component } from '../component/Component';
import { logErr } from '../logger/Logger';
import { decodeRouterPack, encodeRouterPack, handle } from './RouterUtils';
import { protoMgr } from './ProtocolMgr';

export class RouteSubscriber extends Component {
    private sub: Subscription | undefined;
    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;

        // example subject: game.2134
        this.sub = nc?.subscribe(`${this.server.serverType}.*`, { queue: this.server.serverType });
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

    private process(msg: Msg) {
        const index = msg.subject.indexOf('.');
        const routeKey = msg.subject.substring(index + 1);
        const data = decodeRouterPack(Buffer.from(msg.data));
        handle(
            routeKey,
            data.context,
            data.body ? protoMgr.decodeMsgBody(data.body, data.context.protoId) : undefined,
            this.server
        )
            .then((result) => {
                if (msg.reply) {
                    msg.respond(
                        encodeRouterPack(
                            { id: data.context.id },
                            result ? protoMgr.encodeMsgBody(result, data.context.protoId) : undefined
                        )
                    );
                }
            })
            .catch((e: unknown) => {
                logErr(e);
            });
    }

    dispose(): void {
        this.sub?.drain().catch((e: unknown) => {
            logErr(e);
        });
    }
}
