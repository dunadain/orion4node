import type { Message } from '../transport/protocol/ProtocolTypeDefs.mjs';
import { Component } from '../component/Component.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';
import { MsgType } from '../transport/protocol/MsgProcessor.mjs';
import { logErr } from '../logger/Logger.mjs';
import { decodeRouterPack, encodeRouterPack } from './RouterUtils.mjs';
import { ClientManager } from '../component/ClientManager.mjs';
import { protoMgr } from './ProtocolMgr.mjs';

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
            (async () => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const subject = await protoMgr.getHandlerSubject(msg.protoId, client.uid);
                if (!subject) return;
                const buf = encodeRouterPack(
                    {
                        clientId: client.id,
                        protoId: msg.protoId,
                        uid: client.uid,
                        roleid: client.roleid,
                        sUuid: this.server.uuid,
                        reqId: msg.id,
                    },
                    msg.body
                );
                switch (msg.type) {
                    case MsgType.REQUEST:
                        this.nats
                            .tryRequest(subject, buf, { timeout: 1000 })
                            .then((replyu8a) => {
                                const rBuf = Buffer.from(replyu8a);
                                const response = decodeRouterPack(rBuf);
                                const client = clientMgr.getClientById(response.context.clientId);
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
            })().catch((e: unknown) => {
                logErr(e);
            });
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
