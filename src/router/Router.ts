import { ErrorCode, NatsConnection, NatsError, Payload } from 'nats';
import { Message } from '../transport/protocol/ProtocolTypeDefs';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { getRoute } from '../config/Route';
import { MsgType } from '../transport/protocol/MsgProcessor';
import { logErr } from '../logger/Logger';
import { copyArray } from '../transport/protocol/utils';

export class Router extends Component {
    private _nc: NatsConnection | undefined;
    async start() {
        this.server.eventEmitter.on('message', (data: Message) => {
            const msg = data.msg;
            const client = data.client;
            const routeStr = getRoute(msg.route); // servertype.file.method
            const session = {
                id: client.id,
                uid: client.uid,
                sId: this.server.uuid,
            };
            const sessionBuf = Buffer.from(JSON.stringify(session));
            let len = 2; // session buffer length
            len += sessionBuf.length; // session buffer
            len += 4; // body length;
            len += msg.body.length; // body
            const buf = Buffer.alloc(len);
            let offset = buf.writeUInt16BE(sessionBuf.length);
            offset = copyArray(buf, offset, sessionBuf, 0, sessionBuf.length);
            offset = buf.writeUInt32BE(msg.body.length, offset);
            copyArray(buf, offset, msg.body, 0, msg.body.length);
            switch (msg.type) {
                case MsgType.REQUEST:
                    this.tryRequest(routeStr, buf)
                        .then((buffer) => {
                            buffer;
                        })
                        .catch((e: unknown) => {
                            logErr(e);
                        });
                    break;
                case MsgType.NOTIFY:
                    this.nc.publish(routeStr, buf);
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
