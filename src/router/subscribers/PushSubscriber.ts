import type { Msg } from 'nats';
import { decodeRouterPack } from '../RouterUtils';
import { ClientManager } from '../../component/ClientManager';
import { MsgType } from '../../transport/protocol/MsgProcessor';
import { SubscriberBase } from './SubscriberBase';

/**
 * only exist on connector/gate servers to listen for push events
 * and send msgs to clients
 */
export class PushSubscriber extends SubscriberBase {
    private _clientMgr: ClientManager | undefined;

    async init() {
        this.subject = `push.${this.server.uuid}`;
    }

    protected process(msg: Msg) {
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
}
