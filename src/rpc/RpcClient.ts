import { Component } from '../component/Component';
import { NatsComponent } from '../nats/NatsComponent';
import { Constructor } from '../interfaces/defines';
import { Message, Method, RPCImplCallback, Root, Service, rpc } from 'protobufjs';

interface MetaData {
    serverType: string;
    serverId: string;
}

export class RpcClient extends Component {
    private _nats: NatsComponent | undefined;
    private map = new Map<string, unknown>();

    private empty = new Uint8Array(0);

    private rpcImpl(
        metaData: MetaData,
        method: Method | rpc.ServiceMethod<Message, Message>,
        requestData: Uint8Array,
        callback: RPCImplCallback
    ) {
        const method1 = method as Method;
        if (!method1.parent?.name) {
            callback(new Error('service not found'), null);
            return;
        }
        // rpc.game/uuid.lobby.LobbyService.CreateRoom.{CreateRoomRequest}.{CreateRoomResponse}
        const subject =
            'rpc.' +
            (metaData.serverId ? String(metaData.serverId) : metaData.serverType) +
            '.' +
            method1.parent.name +
            '.' +
            method1.name +
            '.{' +
            method1.requestType +
            '}.{' +
            method1.responseType +
            '}';
        if (method1.responseType === 'google.protobuf.Empty') {
            this.nats.publish(subject, requestData);
            callback(null, this.empty);
        } else
            this.nats
                .tryRequest(subject, requestData, { timeout: 1000 })
                .then((res) => {
                    callback(null, res);
                })
                .catch((e: unknown) => {
                    callback(e as Error, null);
                });
    }

    get nats() {
        if (!this._nats) {
            this._nats = this.server.getComponent(NatsComponent);
            if (!this._nats) throw new Error('NatsComponent not found');
        }
        return this._nats;
    }

    addServices(root: Root, serverType: string) {
        for (const k in root.nested) {
            const clazz = root.nested[k];
            const constructor = clazz.constructor as unknown as { className: string };
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
                    value: function (request: unknown, callback?: (err: Error | null, res?: unknown) => void) {
                        const self = this as Proxy;
                        extra.serverId = self.serverId;

                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                        const result = (self.service as any)[methodName](request, callback) as unknown;
                        self.serverId = '';
                        return result;
                    },
                });
            }
            this.map.set(clazz.name, proxy);
        }
    }

    getService<T>(constructor: Constructor<T>): RemoteProxy<T> {
        return this.map.get(constructor.name) as RemoteProxy<T>;
    }
}

class Proxy {
    service!: rpc.Service;
    serverId = '';
    to(svId: string) {
        this.serverId = svId;
        return this;
    }
}

type RemoteProxy<F> = {
    [P in keyof F]: F[P];
} & {
    to(svId: string): RemoteProxy<F>;
};
