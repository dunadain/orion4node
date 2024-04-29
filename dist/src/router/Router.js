"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const Component_1 = require("../component/Component");
const NatsComponent_1 = require("../nats/NatsComponent");
const MsgProcessor_1 = require("../transport/protocol/MsgProcessor");
const Logger_1 = require("../logger/Logger");
const RouterUtils_1 = require("./RouterUtils");
const ClientManager_1 = require("../component/ClientManager");
const ProtocolMgr_1 = require("./ProtocolMgr");
/**
 * only exists in connector or gate server
 */
class Router extends Component_1.Component {
    _nats;
    async start() {
        const clientMgr = this.getComponent(ClientManager_1.ClientManager);
        if (!clientMgr)
            throw new Error('ClientManager Component is required!');
        this.server.eventEmitter.on('message', (data) => {
            const msg = data.msg;
            const client = data.client;
            (async () => {
                const subject = await ProtocolMgr_1.protoMgr.getHandlerSubject(msg.protoId, client.uid);
                if (!subject)
                    return;
                const buf = (0, RouterUtils_1.encodeRouterPack)({
                    id: client.id,
                    protoId: msg.protoId,
                    uid: client.uid,
                    sId: this.server.uuid,
                }, msg.body);
                switch (msg.type) {
                    case MsgProcessor_1.MsgType.REQUEST:
                        this.nats
                            .tryRequest(subject, buf, { timeout: 1000 })
                            .then((replyu8a) => {
                            const rBuf = Buffer.from(replyu8a);
                            const response = (0, RouterUtils_1.decodeRouterPack)(rBuf);
                            const client = clientMgr.getClientById(response.context.id);
                            client?.sendMsg(MsgProcessor_1.MsgType.RESPONSE, msg.protoId, response.body, msg.id);
                        })
                            .catch((e) => {
                            (0, Logger_1.logErr)(e);
                        });
                        break;
                    case MsgProcessor_1.MsgType.NOTIFY:
                        this.nats.publish(subject, buf);
                        break;
                    default:
                        break;
                }
            })().catch((e) => {
                (0, Logger_1.logErr)(e);
            });
        });
    }
    get nats() {
        if (!this._nats) {
            this._nats = this.getComponent(NatsComponent_1.NatsComponent);
            if (!this._nats)
                throw new Error('NatsComponent not found');
        }
        return this._nats;
    }
}
exports.Router = Router;
