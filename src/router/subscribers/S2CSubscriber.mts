import type { Msg } from 'nats';
import { decodeRouterPack } from '../RouterUtils.mjs';
import { ClientManager } from '../../component/ClientManager.mjs';
import { MsgType } from '../../transport/protocol/MsgProcessor.mjs';
import { SubscriberBase } from './SubscriberBase.mjs';

/**
 * only exist on connector/gate servers to listen for push events
 * and send msgs to clients
 */
export class S2CSubscriber extends SubscriberBase {
    private _clientMgr: ClientManager | undefined;

    async init() {
        this.subject = `${this.server.uuid.toString()}.>`;
    }

    protected process(msg: Msg) {
        const data = decodeRouterPack(Buffer.from(msg.data));
        const client = this.clientMgr.getClientById(data.context.clientId);
        client?.sendMsg(MsgType.PUSH, data.context.protoId, data.body);
    }

    get clientMgr() {
        if (!this._clientMgr) {
            this._clientMgr = this.getComponent(ClientManager);
            if (!this._clientMgr) throw new Error('ClientManager Component is required!');
        }
        return this._clientMgr;
    }
}
