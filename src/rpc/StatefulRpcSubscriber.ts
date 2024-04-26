import { RpcSubscriber } from './RpcSubscriber';

/**
 * StatefulRpcSubscriber use unique uuid to listen for rpc events
 */
export class StatefulRpcSubscriber extends RpcSubscriber {
    async init() {
        await super.init();
        this.subject = `rpc.${this.server.uuid}.>`; // example: rpc.{uuid}.{remotehandler}.method.request.response
    }
}
