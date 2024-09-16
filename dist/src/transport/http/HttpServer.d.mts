import { Component } from '../../component/Component.mjs';
export declare class HttpServer extends Component {
    addr: string;
    port: number;
    sslCertPath: string;
    sslKeyPath: string;
    private app;
    init(): Promise<void>;
    dispose(): Promise<void>;
}
