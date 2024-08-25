import { RpcServerBase } from './RpcServerBase';

export class StatelessRpcServer extends RpcServerBase {
	async init() {
		this.subject = `rpc.${this.server.serverType}.>`; // example: rpc.{servertype}.{remotehandler}.method.request.response
		this.opt = { queue: this.server.serverType };
	}
}
