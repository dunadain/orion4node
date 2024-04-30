"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UWebSocketTransport = void 0;
const uWebSockets_js_1 = require("uWebSockets.js");
const Component_1 = require("../../component/Component");
const Logger_1 = require("../../logger/Logger");
const ClientManager_1 = require("../../component/ClientManager");
const UWebSocketClient_1 = require("./UWebSocketClient");
class UWebSocketTransport extends Component_1.Component {
    app;
    _clientMgr;
    constructor(server) {
        super(server);
        this.app = (0, uWebSockets_js_1.App)();
    }
    async init() {
        const host = this.server.addr ? this.server.addr : 'localhost';
        this.app
            .ws('/*', {
            sendPingsAutomatically: false,
            idleTimeout: 0,
            compression: uWebSockets_js_1.DISABLED,
            open: (ws) => {
                const client = new UWebSocketClient_1.UWebSocketClient(this.server.eventEmitter);
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
                    (0, Logger_1.logErr)(e);
                }
            },
            drain: (ws) => {
                const client = this.clientMgr.getClient(ws);
                try {
                    client?.onDrain?.call(client);
                }
                catch (e) {
                    (0, Logger_1.logErr)(e);
                }
            },
            close: (ws) => {
                const client = this.clientMgr.getClient(ws);
                client?.dispose();
                this.clientMgr.removeClient(ws);
            },
        })
            .listen(host, this.server.port, (token) => {
            if (token)
                Logger_1.logger.info(`${this.server.name} is listening on ${host}:${String(this.server.port)}`);
            else
                Logger_1.logger.error(`Server ${this.server.addr} failed to listen`);
        });
    }
    async dispose() {
        this.app.close();
    }
    get clientMgr() {
        if (!this._clientMgr) {
            this._clientMgr = this.getComponent(ClientManager_1.ClientManager);
            if (!this._clientMgr)
                throw new Error('ClientManager Component is required!');
        }
        return this._clientMgr;
    }
}
exports.UWebSocketTransport = UWebSocketTransport;
