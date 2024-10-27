import { Component } from '../component/Component.mjs';
import type { Constructor } from '../index.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';

class RpcRequest<T1, T2> {
    serverId = '';
    serverType = '';
    rpcProto = '';
    reqType: Constructor<T1> | undefined;
    resType: Constructor<T2> | undefined;
    nats: NatsComponent | undefined;

    /**
     * 向哪个服务器发送
     * @param svUuid 服务器uuid
     * @returns
     */
    to(svUuid: string) {
        this.serverId = svUuid;
        return this;
    }

    async request(requestData: unknown) {
        if (!this.rpcProto) throw new Error('rpcProto is required');
        if (!this.serverType && !this.serverId) throw new Error('serverType or serverId must be set');
        /* eslint-disable */
        const reqType = this.reqType as any;
        const err = reqType.verify(requestData);
        if (err) throw new Error(err);
        const bytes = reqType.encode(reqType.create(requestData)).finish();
        // rpc.servertype/serverid.rpcProto
        // example: rpc.gate.Greeter.SayHello
        const subject = `rpc.${this.serverId ? String(this.serverId) : this.serverType}.${this.rpcProto}`;
        const res = await this.nats?.tryRequest(subject, bytes, { timeout: 1000 });
        const resType = this.resType as any;
        return resType.decode(res) as T2;
    }
}

export class RpcClient extends Component {
    private _nats: NatsComponent | undefined;

    private empty = new Uint8Array(0);

    createRpcCall<T1, T2>(rpcProto: string, reqType: Constructor<T1>, resType: Constructor<T2>, serverType: string) {
        const rpcRequest = new RpcRequest<T1, T2>();
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
            if (!this._nats) throw new Error('NatsComponent not found');
        }
        return this._nats;
    }
}
