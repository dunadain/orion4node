import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import type { Constructor } from '../interfaces/defines';
export declare class RpcClient extends Component {
    private _nats;
    private map;
    private empty;
    private rpcImpl;
    get nats(): NatsComponent;
    addServices(packageRoot: any, serverType: string): void;
    getService<T>(constructor: Constructor<T>): RemoteProxy<T>;
}
type RemoteProxy<F> = {
    [P in keyof F]: F[P];
} & {
    to(svId: number): RemoteProxy<F>;
};
export {};
