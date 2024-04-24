import { NatsConnection } from 'nats';
import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { Constructor } from '../TypeDef';
import { Message, Method, Namespace, RPCImplCallback, Service, rpc } from 'protobufjs';

interface MetaData {
    serverType: string;
    serverId: string;
    publish: boolean;
}

export class RpcClient extends Component {
    private _nc: NatsConnection | undefined;
    private map = new Map<string, unknown>();

    private rpcImpl(
        metaData: MetaData,
        method: Method | rpc.ServiceMethod<Message, Message>,
        requestData: Uint8Array,
        callback: RPCImplCallback
    ) {
        const method1 = method as Method;
        const serviceName = method1.parent?.name;
        if (!serviceName) {
            callback(new Error('service not found'), null);
            return;
        }
        const subject = `rpc.${metaData.serverId ? String(metaData.serverId) : metaData.serverType}.${serviceName}.${
            method.name
        }.${method1.requestType}.${method1.responseType}`;
        if (metaData.publish) {
            this.nc.publish(subject, requestData);
            callback(null, null);
        } else
            this.nc
                .request(subject, requestData, { timeout: 1000 })
                .then((res) => {
                    callback(null, res.data);
                })
                .catch((e: unknown) => {
                    callback(e as Error, null);
                });
    }

    get nc() {
        if (!this._nc) {
            this._nc = this.server.getComponent(NatsComponent)?.nc;
            if (!this._nc) throw new Error('NatsComponent not found');
        }
        return this._nc;
    }

    addServices(root: Namespace, serverType: string) {
        for (const k in root.nested) {
            const clazz = root.nested[k];
            const constructor = clazz as unknown as { className: string };
            if (constructor.className !== 'Service') continue;
            const serviceClazz = clazz as Service;
            const extra = {
                serverType: serverType,
                serverId: '',
                publish: false,
            };
            const service = serviceClazz.create(this.rpcImpl.bind(this, extra), false, false);
            const proxy = new Proxy();
            proxy.service = service;
            for (const key in serviceClazz.methods) {
                const methodName = key.charAt(0).toLowerCase() + key.slice(1);
                Object.defineProperty(proxy, methodName, {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value: function (...args: any[]) {
                        const self = this as Proxy;
                        extra.serverId = self.serverId;
                        extra.publish = self.mute;
                        if (!self.service) throw new Error('service not found');
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
                        const result = (self.service as Record<string, any>)[key](...args);
                        self.serverId = '';
                        self.mute = false;
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return result;
                    },
                });
            }
            this.map.set(clazz.name, proxy);
        }
        // for (const key in root) {
        //     if (!root[key]) continue;
        //     if (Object.hasOwn(root[key], 'methods')) {
        //         const constructor = root[key];
        //         const extra = {
        //             serverType: serverType,
        //             serverId: '',
        //             publish: false,
        //         };
        //         const service = constructor.create(this.rpcImpl.bind(this, extra), false, false);
        //         const proxy = new Proxy();
        //         proxy.service = service;
        //         for (const key in service) {
        //             if (key === 'rpcImpl') continue;
        //             if (Object.hasOwn(service, key) && typeof service[key] === 'function') {
        //                 Object.defineProperty(proxy, key, {
        //                     value: function (...args: any[]) {
        //                         extra.serverId = this.serverId;
        //                         extra.publish = this.mute;
        //                         const result = this.service[key](...args);
        //                         this.serverId = '';
        //                         this.mute = false;
        //                         return result;
        //                     },
        //                 });
        //             }
        //         }
        //         this.map.set(constructor.name, proxy);
        //     }
        // }
    }

    getService<T>(constructor: Constructor<T>): RemoteProxy<T> {
        return this.map.get(constructor.name) as RemoteProxy<T>;
    }
}

class Proxy {
    service: rpc.Service | undefined;
    serverId = '';
    mute = false;
    to(svId: string) {
        this.serverId = svId;
        return this;
    }

    /**
     * do not need feedback
     * @returns
     */
    publish() {
        this.mute = true;
        return this;
    }
}

type RemoteProxy<F> = {
    [P in keyof F]: F[P];
} & {
    to(svId: string): RemoteProxy<F>;
    publish(): RemoteProxy<F>;
};
