import { RpcServerBase } from './RpcServerBase.mjs';
/**
 * StatefulRpcServer use unique uuid to listen for rpc events
 */
export declare class StatefulRpcServer extends RpcServerBase {
    init(): Promise<void>;
}
