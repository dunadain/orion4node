import { App, DISABLED } from 'uWebSockets.js';
import { Component } from '../../component/Component.mjs';
import { logErr, logger } from '../../logger/Logger.mjs';
import { ClientManager } from '../../component/ClientManager.mjs';
import { UWebSocketClient } from './UWebSocketClient.mjs';
export class UWebSocketTransport extends Component {
    addr = '';
    port = 0;
    app;
    _clientMgr;
    constructor(server) {
        super(server);
        this.app = App();
    }
    async init() {
        const host = this.addr ? this.addr : 'localhost';
        this.app
            .ws('/*', {
            sendPingsAutomatically: false,
            idleTimeout: 0,
            compression: DISABLED,
            open: (ws) => {
                const client = new UWebSocketClient(this.server.eventEmitter);
                client.socket = ws;
                client.init();
                this.clientMgr.addClient(client);
            },
            message: (ws, message) => {
                const client = this.clientMgr.getClient(ws);
                if (!client)
                    return;
                try {
                    client.onMessage(message);
                }
                catch (e) {
                    client.disconnect();
                    logErr(e);
                }
            },
            drain: (ws) => {
                const client = this.clientMgr.getClient(ws);
                try {
                    client?.onDrain?.call(client);
                }
                catch (e) {
                    logErr(e);
                }
            },
            close: (ws) => {
                const client = this.clientMgr.getClient(ws);
                client?.dispose();
                this.clientMgr.removeClient(ws);
            },
        })
            .listen(host, this.port, (token) => {
            if (token)
                logger.info(`${this.server.name} is listening on ${host}:${String(this.port)}`);
            else
                logger.error(`Server ${this.addr} failed to listen`);
        });
    }
    async dispose() {
        this.app.close();
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
