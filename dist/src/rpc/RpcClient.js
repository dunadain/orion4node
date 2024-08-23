"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcClient = void 0;
const Component_1 = require("../component/Component");
const NatsComponent_1 = require("../nats/NatsComponent");
class RpcClient extends Component_1.Component {
    _nats;
    map = new Map();
    empty = new Uint8Array(0);
    rpcImpl(metaData, method, requestData, callback) {
        const method1 = method;
        if (!method1.parent?.name) {
            callback(new Error('service not found'), null);
            return;
        }
        // rpc.game/uuid.Greeter.SayHello.{HelloRequest}.{HelloReply}
        // 类型可能为google.protobuf.Empty， 所以需要{}包裹
        const subject = 'rpc.' +
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
        }
        else
            this.nats
                .tryRequest(subject, requestData, { timeout: 1000 })
                .then((res) => {
                callback(null, res);
            })
                .catch((e) => {
                callback(e, null);
            });
    }
    get nats() {
        if (!this._nats) {
            this._nats = this.server.getComponent(NatsComponent_1.NatsComponent);
            if (!this._nats)
                throw new Error('NatsComponent not found');
        }
        return this._nats;
    }
    addServices(root, serverType) {
        for (const k in root.nested) {
            const clazz = root.nested[k];
            const constructor = clazz.constructor;
            if (constructor.className !== 'Service')
                continue;
            const serviceClazz = clazz;
            const extra = {
                serverType: serverType,
                serverId: -1,
                publish: false,
            };
            const service = serviceClazz.create(this.rpcImpl.bind(this, extra), false, false);
            const proxy = new Proxy();
            proxy.service = service;
            for (const key in serviceClazz.methods) {
                const methodName = key.charAt(0).toLowerCase() + key.slice(1);
                Object.defineProperty(proxy, methodName, {
                    value: function (request, callback) {
                        const self = this;
                        extra.serverId = self.serverId;
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                        const result = self.service[methodName](request, callback);
                        self.serverId = 0;
                        return result;
                    },
                });
            }
            this.map.set(clazz.name, proxy);
        }
    }
    getService(constructor) {
        return this.map.get(constructor.name);
    }
}
exports.RpcClient = RpcClient;
class Proxy {
    service;
    serverId = 0;
    to(svId) {
        this.serverId = svId;
        return this;
    }
}
