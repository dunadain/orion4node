import { Subscription } from 'nats';
import { NatsComponent } from '../nats/NatsComponent';
import { Component } from '../component/Component';
import { logErr, logger } from '../logger/Logger';
import { decodeRouterPack, encodeRouterPack, routeFunctions } from './RouterUtils';
import { ProtocolMgr } from './ProtocolMgr';

export class RouteSubscriber extends Component {
    private sub: Subscription | undefined;
    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;
        const protocolMgr = this.getComponent(ProtocolMgr);
        if (!protocolMgr) throw new Error('protocolMgr is required!');

        // example subject: game.2134
        this.sub = nc?.subscribe(`${this.server.serverType}.*`, {
            queue: this.server.serverType,
            callback: (err, msg) => {
                if (err) {
                    logger.error(`subscription error: ${err.message}`);
                    return;
                }
                const index = msg.subject.indexOf('.');
                const routeKey = msg.subject.substring(index + 1);
                const data = decodeRouterPack(Buffer.from(msg.data));
                const func = routeFunctions.get(routeKey);
                func?.call(
                    null,
                    data.session,
                    data.body ? protocolMgr.decodeMsgBody(data.body) : undefined,
                    this.server
                )
                    .then((result) => {
                        if (msg.reply) {
                            msg.respond(
                                encodeRouterPack(
                                    { id: data.session.id },
                                    result ? protocolMgr.encodeMsgBody(result) : undefined
                                )
                            );
                        }
                    })
                    .catch((e: unknown) => {
                        logErr(e);
                    });
            },
        });
    }

    dispose(): void {
        this.sub?.drain().catch((e: unknown) => {
            logErr(e);
        });
    }
}
