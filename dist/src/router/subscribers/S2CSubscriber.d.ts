import { Msg } from 'nats';
import { ClientManager } from '../../component/ClientManager';
import { SubscriberBase } from './SubscriberBase';
/**
 * only exist on connector/gate servers to listen for push events
 * and send msgs to clients
 */
export declare class S2CSubscriber extends SubscriberBase {
    private _clientMgr;
    init(): Promise<void>;
    protected process(msg: Msg): void;
    get clientMgr(): ClientManager;
}
