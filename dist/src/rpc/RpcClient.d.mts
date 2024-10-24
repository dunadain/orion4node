import { Component } from '../component/Component.mjs';
import type { Constructor } from '../index.mjs';
import { NatsComponent } from '../nats/NatsComponent.mjs';
declare class RpcRequest<T1, T2> {
    serverId: string;
    serverType: string;
    rpcProto: string;
    reqType: Constructor<T1> | undefined;
    resType: Constructor<T2> | undefined;
    nats: NatsComponent | undefined;
    /**
     * 向哪个服务器发送
     * @param svUuid 服务器uuid
     * @returns
     */
    to(svUuid: string): this;
    request(requestData: unknown): Promise<T2>;
}
export declare class RpcClient extends Component {
    private _nats;
    private empty;
    createRpcCall<T1, T2>(rpcProto: string, reqType: Constructor<T1>, resType: Constructor<T2>, serverType: string): RpcRequest<T1, T2>;
    get nats(): NatsComponent;
}
export {};
