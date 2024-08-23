"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientManager = void 0;
const Logger_1 = require("../logger/Logger");
const Component_1 = require("./Component");
class ClientManager extends Component_1.Component {
    // native socket/client
    map = new Map();
    // session id/client
    id2Client = new Map();
    // user uuid/session id
    bindedClientMap = new Map();
    idGenerator = 0;
    addClient(client) {
        client.id = this.idGenerator++;
        if (this.idGenerator == 0xffffffff)
            this.idGenerator = 0;
        this.map.set(client.socket, client);
        this.id2Client.set(client.id, client);
    }
    /**
     * remove client by its session id or native socket
     * @param key session id(number) or native socket
     */
    removeClient(key) {
        if (typeof key === 'number') {
            // session id
            const client = this.id2Client.get(key);
            if (client)
                this.clear(client);
        }
        else {
            // key is native socket
            const client = this.map.get(key);
            if (client)
                this.clear(client);
        }
        // if no connection remains, reset id generator
        if (this.map.size === 0)
            this.idGenerator = 0;
    }
    clear(client) {
        this.map.delete(client.socket);
        this.id2Client.delete(client.id);
        if (client.uid)
            this.bindedClientMap.delete(client.uid);
    }
    /**
     * get client by native socket
     * @param key native socket
     * @returns
     */
    getClient(key) {
        return this.map.get(key);
    }
    /**
     * get client by session id
     * @param id session id
     * @returns
     */
    getClientById(id) {
        return this.id2Client.get(id);
    }
    /**
     * bind socketclient to user uuid
     * @param id
     * @param uid
     */
    bind(id, uid) {
        const client = this.id2Client.get(id);
        if (!client)
            return;
        if (this.hasClientFor(uid) || client.uid) {
            Logger_1.logger.error(`duplicate bindings, trying to bind ${uid} to ${String(id)}`);
            return;
        }
        if (uid) {
            client.uid = uid;
            this.bindedClientMap.set(uid, id);
        }
    }
    hasClientFor(uid) {
        return this.bindedClientMap.has(uid);
    }
    getSessionId(uid) {
        return this.bindedClientMap.get(uid) ?? -1;
    }
}
exports.ClientManager = ClientManager;
