import { logger } from '../logger/Logger';
import { SocketClient } from '../transport/WsClient';
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
        client.id = ++this.idGenerator;
        this.map.set(client.socket, client);
        this.id2Client.set(client.id, client);
    }

    /**
     * remove client by its session id or native socket
     * @param key session id(number) or native socket
     */
    removeClient<T>(key: T) {
        if (typeof key === 'number') { // session id
            const client = this.id2Client.get(key);
            if (client) this.clear(client);
        } else { // key is native socket
            const client = this.map.get(key);
            if (client) this.clear(client);
        }
        // if no connection remains, reset id generator
        if (this.map.size === 0) this.idGenerator = 0;
    }

    private clear<T>(client: SocketClient<T>) {
        this.map.delete(client.socket);
        this.id2Client.delete(client.id);
        if (client.uuidForUser) this.bindedClientMap.delete(client.uuidForUser);
    }

    /**
     * get client by native socket
     * @param key native socket
     * @returns 
     */
    getClient<T>(key: T) {
        return this.map.get(key) as SocketClient<T>;
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
     * @param uuidForUser 
     */
    bind(id: number, uuidForUser: string) {
        if (this.hasClientFor(uuidForUser)) {
            logger.error(`duplicate bindings, trying to bind ${uuidForUser} to ${String(id)}`);
            return;
        }
        const client = this.id2Client.get(id);
        if (client && uuidForUser) {
            client.uuidForUser = uuidForUser;
            this.bindedClientMap.set(uuidForUser, id);
        }
    }

    hasClientFor(uuid: string) {
        return this.bindedClientMap.has(uuid);
    }

    getSessionId(uuid: string) {
        return this.bindedClientMap.get(uuid) ?? 0;
    }
}