import { NatsConnection } from 'nats';
import { Message } from '../transport/protocol/ProtocolTypeDefs';
import { Component } from './Component';
import { NatsComponent } from '../nats/NatsComponent';
import { getRoute } from '../config/Route';
import { MsgType } from '../transport/protocol/MsgProcessor';

export class Router extends Component {
    private _nc: NatsConnection | undefined;
    async start() {
        this.server.eventEmitter.on('message', (data: Message) => {
            const msg = data.msg;
            const routeStr = getRoute(msg.route); // server.file.method
            switch (msg.type) {
                case MsgType.REQUEST:
                    this.nc
                        .request(routeStr, msg.body)
                        .then((response) => {
                            response.data;
                        })
                        .catch(() => {
                            //
                        });
                    break;
                case MsgType.NOTIFY:
                    this.nc.publish(routeStr, msg.body);
                    break;
                default:
                    break;
            }
        });
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
