import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { Constructor } from '../interfaces/defines';
import { Root } from 'protobufjs';
export declare class RpcClient extends Component {
    private _nats;
    private map;
    private rpcImpl;
    get nats(): NatsComponent;
    addServices(root: Root, serverType: string): void;
    getService<T>(constructor: Constructor<T>): RemoteProxy<T>;
}
type RemoteProxy<F> = {
    [P in keyof F]: F[P];
} & {
    to(svId: string): RemoteProxy<F>;
    publish(): RemoteProxy<F>;
};
export {};
