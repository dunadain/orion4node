import { Msg, Subscription } from 'nats';
import { Component } from '../../component/Component';
import { NatsComponent } from '../../nats/NatsComponent';
import { logErr } from '../../logger/Logger';
import { decodeRouterPack } from '../RouterUtils';
import { ClientManager } from '../../component/ClientManager';
import { MsgType } from '../../transport/protocol/MsgProcessor';

/**
 * only exist on connector/gate servers to listen for push events
 * and send msgs to clients
 */
export class PushSubscriber extends Component {
    private sub: Subscription | undefined;
    private _clientMgr: ClientManager | undefined;
    async start() {
        const nc = this.getComponent(NatsComponent)?.nc;
        this.sub = nc?.subscribe(this.server.uuid);
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
        const data = decodeRouterPack(Buffer.from(msg.data));
        const client = this.clientMgr.getClientById(data.context.id);
        client?.sendMsg(MsgType.PUSH, data.context.protoId, data.body);
    }

    get clientMgr() {
        if (!this._clientMgr) {
            this._clientMgr = this.getComponent(ClientManager);
            if (!this._clientMgr) throw new Error('ClientManager Component is required!');
        }
        return this._clientMgr;
    }

    dispose(): void {
        this.sub?.drain().catch((e: unknown) => {
            logErr(e);
        });
    }
}
