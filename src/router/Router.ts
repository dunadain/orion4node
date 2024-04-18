import { ErrorCode, NatsConnection, NatsError, Payload } from 'nats';
import { Message } from '../transport/protocol/ProtocolTypeDefs';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { MsgType } from '../transport/protocol/MsgProcessor';
import { logErr } from '../logger/Logger';
import { decodeRouterPack, encodeRouterPack } from './RouterUtils';
import { ClientManager } from '../component/ClientManager';
import { ProtocolMgr } from './ProtocolMgr';

export class Router extends Component {
    private _nc: NatsConnection | undefined;

    async start() {
        const clientMgr = this.getComponent(ClientManager);
        if (!clientMgr) throw new Error('ClientManager Component is required!');
        const protoMgr = this.getComponent(ProtocolMgr);
        if (!protoMgr) throw new Error('ProtocolMgr Component is required!');

        this.server.eventEmitter.on('message', (data: Message) => {
            const msg = data.msg;
            const client = data.client;

            const subject = protoMgr.getSubject(msg.route);
            if (!subject) return;

            const buf = encodeRouterPack(
                {
                    id: client.id,
                    uid: client.uid,
                    sId: this.server.uuid,
                },
                msg.body
            );
            switch (msg.type) {
                case MsgType.REQUEST:
                    this.tryRequest(subject, buf)
                        .then((replyu8a) => {
                            const rBuf = Buffer.from(replyu8a);
                            const response = decodeRouterPack(rBuf);
                            const client = clientMgr.getClientById(response.session.id);
                            client?.sendMsg(MsgType.RESPONSE, msg.route, response.body, msg.id);
                        })
                        .catch((e: unknown) => {
                            logErr(e);
                        });
                    break;
                case MsgType.NOTIFY:
                    this.nc.publish(subject, buf);
                    break;
                default:
                    break;
            }
        });
    }

    // try 3 times, before consider it totally failed;
    private async tryRequest(subject: string, payload: Payload) {
        for (let i = 0; i < 3; ++i) {
            try {
                const rep = await this.nc.request(subject, payload, { timeout: 3000 });
                return rep.data;
            } catch (e: unknown) {
                const nErr = e as NatsError;
                if ((nErr.code as ErrorCode) === ErrorCode.NoResponders) {
                    throw e;
                }
            }
        }
        throw new Error('timeout');
    }

    get nc() {
        if (!this._nc) {
            const nats = this.getComponent(NatsComponent);
            if (!nats?.nc) throw new Error('nats component is required');
            this._nc = nats.nc;
        }
        return this._nc;
    }
}
