import { Component } from '../../component/Component.mjs';
import { ClientManager } from '../../component/ClientManager.mjs';
import type { Server } from '../../server/Server.mjs';
export declare class UWebSocketTransport extends Component {
    addr: string;
    port: number;
    private app;
    private _clientMgr;
    constructor(server: Server);
    init(): Promise<void>;
    dispose(): Promise<void>;
    get clientMgr(): ClientManager;
}
