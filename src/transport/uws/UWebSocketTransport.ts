import { App, DISABLED, TemplatedApp } from 'uWebSockets.js';
import { Component } from '../../component/Component';
import { logErr, logger } from '../../logger/Logger';
import { ClientManager } from '../../component/ClientManager';
import { UWebSocketClient } from './UWebSocketClient';
import { Server } from '../../server/Server';

export class UWebSocketTransport extends Component {
    private app: TemplatedApp;
    private _clientMgr: ClientManager | undefined;

    constructor(server: Server) {
        super(server);
        this.app = App();
    }

    async init() {
        const host = this.server.addr ? this.server.addr : 'localhost';
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
                    if (!client) return;
                    try {
                        client.onMessage(message);
                    } catch (e) {
                        client.disconnect();
                        logErr(e);
                    }
                },
                drain: (ws) => {
                    const client = this.clientMgr.getClient(ws);
                    try {
                        client?.onDrain?.call(client);
                    } catch (e) {
                        logErr(e);
                    }
                },
                close: (ws) => {
                    const client = this.clientMgr.getClient(ws);
                    client?.dispose();
                    this.clientMgr.removeClient(ws);
                },
            })
            .listen(host, this.server.port, (token) => {
                if (token) logger.info(`Listening on ${host}:${String(this.server.port)}`);
                else logger.error(`Server ${this.server.addr} failed to listen`);
            });
    }

    async dispose() {
        this.app.close();
    }

    get clientMgr() {
        if (!this._clientMgr) {
            this._clientMgr = this.getComponent(ClientManager);
            if (!this._clientMgr) throw new Error('ClientManager Component is required!');
        }
        return this._clientMgr;
    }
}
