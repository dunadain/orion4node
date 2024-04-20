import { Subscription } from 'nats';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { logErr } from '../logger/Logger';
import { decodeRouterPack } from './RouterUtils';
import { ClientManager } from '../component/ClientManager';
import { MsgType } from '../transport/protocol/MsgProcessor';

export class PushSubscriber extends Component {
    private sub: Subscription | undefined;
    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;
        const clientMgr = this.getComponent(ClientManager);
        if (!clientMgr) throw new Error('ClientManager is required');

        this.sub = nc?.subscribe(this.server.uuid, {
            callback: (err, msg) => {
                if (err) {
                    console.log('subscription error', err.message);
                    return;
                }
                const data = decodeRouterPack(Buffer.from(msg.data));
                const client = clientMgr.getClientById(data.context.id);
                client?.sendMsg(MsgType.PUSH, data.context.protoId, data.body);
            },
        });
    }

    dispose(): void {
        this.sub?.drain().catch((e: unknown) => {
            logErr(e);
        });
    }
}
