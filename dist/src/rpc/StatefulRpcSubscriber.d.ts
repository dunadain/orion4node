import { RpcSubscriber } from './RpcSubscriber';
/**
 * StatefulRpcSubscriber use unique uuid to listen for rpc events
 */
export declare class StatefulRpcSubscriber extends RpcSubscriber {
    init(): Promise<void>;
}
