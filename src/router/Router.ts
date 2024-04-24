import { Message } from '../transport/protocol/ProtocolTypeDefs';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { MsgType } from '../transport/protocol/MsgProcessor';
import { logErr } from '../logger/Logger';
import { decodeRouterPack, encodeRouterPack } from './RouterUtils';
import { ClientManager } from '../component/ClientManager';
import { protoMgr } from './ProtocolMgr';

/**
 * only exists in connector or gate server
 */
export class Router extends Component {
    private _nats: NatsComponent | undefined;

    async start() {
        const clientMgr = this.getComponent(ClientManager);
        if (!clientMgr) throw new Error('ClientManager Component is required!');

        this.server.eventEmitter.on('message', (data: Message) => {
            const msg = data.msg;
            const client = data.client;

            const subject = protoMgr.getSubject(msg.protoId);
            if (!subject) return;

            const buf = encodeRouterPack(
                {
                    id: client.id,
                    protoId: msg.protoId,
                    uid: client.uid,
                    sId: this.server.uuid,
                },
                msg.body
            );
            switch (msg.type) {
                case MsgType.REQUEST:
                    this.nats
                        .tryRequest(subject, buf)
                        .then((replyu8a) => {
                            const rBuf = Buffer.from(replyu8a);
                            const response = decodeRouterPack(rBuf);
                            const client = clientMgr.getClientById(response.context.id);
                            client?.sendMsg(MsgType.RESPONSE, msg.protoId, response.body, msg.id);
                        })
                        .catch((e: unknown) => {
                            logErr(e);
                        });
                    break;
                case MsgType.NOTIFY:
                    this.nats.publish(subject, buf);
                    break;
                default:
                    break;
            }
        });
    }

    get nats() {
        if (!this._nats) {
            this._nats = this.getComponent(NatsComponent);
            if (!this._nats) throw new Error('NatsComponent not found');
        }
        return this._nats;
    }
}
