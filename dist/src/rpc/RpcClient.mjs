import { Component } from '../component/Component.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';
class RpcRequest {
    serverId = '';
    serverType = '';
    rpcProto = '';
    reqType;
    resType;
    nats;
    /**
     * 向哪个服务器发送
     * @param svUuid 服务器uuid
     * @returns
     */
    to(svUuid) {
        this.serverId = svUuid;
        return this;
    }
    async request(requestData) {
        if (!this.rpcProto)
            throw new Error('rpcProto is required');
        if (this.serverType && this.serverId)
            throw new Error('serverType and serverId cannot be set at the same time');
        if (!this.serverType && !this.serverId)
            throw new Error('serverType or serverId must be set');
        /* eslint-disable */
        const reqType = this.reqType;
        const err = reqType.verify(requestData);
        if (err)
            throw new Error(err);
        const bytes = reqType.encode(reqType.create(requestData)).finish();
        // rpc.servertype/serverid.rpcProto
        // example: rpc.gate.Greeter.SayHello
        const subject = `rpc.${this.serverId ? String(this.serverId) : this.serverType}.${this.rpcProto}`;
        const res = await this.nats?.tryRequest(subject, bytes, { timeout: 1000 });
        const resType = this.resType;
        return resType.decode(res);
    }
}
export class RpcClient extends Component {
    _nats;
    empty = new Uint8Array(0);
    createRpcCall(rpcProto, reqType, resType, serverType) {
        const rpcRequest = new RpcRequest();
        rpcRequest.rpcProto = rpcProto;
        rpcRequest.reqType = reqType;
        rpcRequest.resType = resType;
        rpcRequest.serverType = serverType;
        rpcRequest.nats = this.nats;
        return rpcRequest;
    }
    get nats() {
        if (!this._nats) {
            this._nats = this.server.getComponent(NatsComponent);
            if (!this._nats)
                throw new Error('NatsComponent not found');
        }
        return this._nats;
    }
}
