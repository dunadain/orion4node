import { Component } from '../../component/Component';
import { ClientManager } from '../../component/ClientManager';
import { Server } from '../../server/Server';
export declare class UWebSocketTransport extends Component {
    private app;
    private _clientMgr;
    constructor(server: Server);
    init(): Promise<void>;
    dispose(): Promise<void>;
    get clientMgr(): ClientManager;
}
