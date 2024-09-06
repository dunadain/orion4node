/* eslint-disable */
import { Component } from '../component/Component.mjs';
import type { Constructor } from '../index.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';

class RpcRequest<T1, T2> {
    serverId = 0;
    serverType = '';
    rpcProto = '';
    reqType: Constructor<T1> | undefined;
    resType: Constructor<T2> | undefined;
    nats: NatsComponent | undefined;

    /**
     * 向哪个服务器发送
     * @param svId 服务器id
     * @returns
     */
    to(svId: number) {
        this.serverId = svId;
        return this;
    }

    async request(requestData: unknown) {
        const reqType = this.reqType as any;
        const bytes = reqType.encode(reqType.create(requestData)).finish();
        const subject = `rpc.${this.serverId ? String(this.serverId) : this.serverType}.${this.rpcProto}`;
        const res = await this.nats?.tryRequest(subject, bytes, { timeout: 1000 });
        const resType = this.resType as any;
        return resType.decode(res) as T2;
    }
}

export class RpcClient extends Component {
    private _nats: NatsComponent | undefined;

    private empty = new Uint8Array(0);

    createRpcCall<T1, T2>(rpcProto: string, reqType: any, resType: any, serverType: string) {
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
