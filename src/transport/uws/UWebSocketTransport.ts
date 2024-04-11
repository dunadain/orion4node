import { App, DISABLED } from 'uWebSockets.js';
import { Component } from '../../component/Component';
import { logger } from '../../logger/Logger';
import { ClientManager } from '../../component/ClientManager';
import { UWebSocketClient } from './UWebSocketClient';
import { EventEmitter } from 'node:events';

export class UWebSocketTransport extends Component {
    readonly eventEmitter = new EventEmitter();
    private _clientMgr: ClientManager | undefined;
    async start() {
        const app = App();
        const host = this.server.addr ? this.server.addr : 'localhost';
        app.ws('/*', {
            sendPingsAutomatically: false,
            idleTimeout: 0,
            compression: DISABLED,
            open: (ws) => {
                const client = new UWebSocketClient(this.eventEmitter);
                client.socket = ws;
                client.init();
                this.clientMgr.addClient(client);
            },
            message: (ws, message) => {
                this.clientMgr.getClient(ws)?.onMessage(message);
            },
            drain: (ws) => {
                const client = this.clientMgr.getClient(ws);
                client?.onDrain?.call(client);
            },
            close: (ws) => {
                const client = this.clientMgr.getClient(ws);
                client?.dispose();
                this.clientMgr.removeClient(ws);
            },
        }).listen(host, this.server.port, (token) => {
            if (token)
                logger.info(`Listening on ${host}:${String(this.server.port)}`);
            else logger.error(`Server ${this.server.addr} failed to listen`);
        });
    }

    get clientMgr() {
        if (!this._clientMgr) {
            this._clientMgr = this.getComponent(ClientManager);
            if (!this._clientMgr)
                throw new Error('ClientManager Component is required!');
        }
        return this._clientMgr;
    }
}
