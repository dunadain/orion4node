import { RpcSubscriber } from './RpcSubscriber';

export class StatelessRpcSubscriber extends RpcSubscriber {
    async init() {
        await super.init();
        this.subject = `rpc.${this.server.serverType}.>`; // example: rpc.{servertype}.{remotehandler}.method.request.response
        this.opt = { queue: this.server.serverType };
    }
}
