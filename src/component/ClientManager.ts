import { logger } from '../logger/Logger';
import { SocketClient } from '../transport/SocketClient';
import { Component } from './Component';

export class ClientManager extends Component {
    // native socket/client
    private map = new Map<unknown, SocketClient<unknown>>();
    // session id/client
    private id2Client = new Map<number, SocketClient<unknown>>();
    // user uuid/session id
    private bindedClientMap = new Map<string, number>();
    private idGenerator = 0;

    addClient<T>(client: SocketClient<T>) {
        client.id = this.idGenerator++;
        if (this.idGenerator == 0xffffffff) this.idGenerator = 0;
        this.map.set(client.socket, client);
        this.id2Client.set(client.id, client);
    }

    /**
     * remove client by its session id or native socket
     * @param key session id(number) or native socket
     */
    removeClient<T>(key: T) {
        if (typeof key === 'number') {
            // session id
            const client = this.id2Client.get(key);
            if (client) this.clear(client);
        } else {
            // key is native socket
            const client = this.map.get(key);
            if (client) this.clear(client);
        }
        // if no connection remains, reset id generator
        if (this.map.size === 0) this.idGenerator = 0;
    }

    private clear<T>(client: SocketClient<T>) {
        this.map.delete(client.socket);
        this.id2Client.delete(client.id);
        if (client.uid) this.bindedClientMap.delete(client.uid);
    }

    /**
     * get client by native socket
     * @param key native socket
     * @returns
     */
    getClient<T>(key: T) {
        return this.map.get(key) as SocketClient<T> | undefined;
    }

    /**
     * get client by session id
     * @param id session id
     * @returns
     */
    getClientById(id: number) {
        return this.id2Client.get(id);
    }

    /**
     * bind socketclient to user uuid
     * @param id
     * @param uid
     */
    bind(id: number, uid: string) {
        const client = this.id2Client.get(id);
        if (!client) return;
        if (this.hasClientFor(uid) || client.uid) {
            logger.error(`duplicate bindings, trying to bind ${uid} to ${String(id)}`);
            return;
        }

        if (uid) {
            client.uid = uid;
            this.bindedClientMap.set(uid, id);
        }
    }

    hasClientFor(uid: string) {
        return this.bindedClientMap.has(uid);
    }

    getSessionId(uid: string) {
        return this.bindedClientMap.get(uid) ?? -1;
    }
}
