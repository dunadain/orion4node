import { Component } from '../../component/Component';
import { ClientManager } from '../../component/ClientManager';
import type { Server } from '../../server/Server';
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
