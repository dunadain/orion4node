import { App, DISABLED, type TemplatedApp } from 'uWebSockets.js';
import { Component } from '../../component/Component';
import { logErr, logger } from '../../logger/Logger';
import { ClientManager } from '../../component/ClientManager';
import { UWebSocketClient } from './UWebSocketClient';
import type { Server } from '../../server/Server';

export class UWebSocketTransport extends Component {
	public addr = '';
	public port = 0;
	private app: TemplatedApp;
	private _clientMgr: ClientManager | undefined;

	constructor(server: Server) {
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
			.listen(host, this.port, (token) => {
				if (token)
					logger.info(
						`${this.server.name} is listening on ${host}:${String(this.port)}`,
					);
				else logger.error(`Server ${this.addr} failed to listen`);
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
