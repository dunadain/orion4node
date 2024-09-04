import { RpcServerBase } from './RpcServerBase.mjs';

/**
 * StatefulRpcServer use unique uuid to listen for rpc events
 */
export class StatefulRpcServer extends RpcServerBase {
	async init() {
		this.subject = `rpc.${this.server.uuid.toString()}.>`; // example: rpc.{uuid}.{remotehandler}.method.request.response
	}
}
