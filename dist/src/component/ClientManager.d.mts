import type { SocketClient } from '../transport/SocketClient.mjs';
import { Component } from './Component.mjs';
export declare class ClientManager extends Component {
    private map;
    private id2Client;
    private bindedClientMap;
    private idGenerator;
    addClient<T>(client: SocketClient<T>): void;
    /**
     * remove client by its session id or native socket
     * @param key session id(number) or native socket
     */
    removeClient(key: unknown): void;
    private clear;
    /**
     * get client by native socket
     * @param key native socket
     * @returns
     */
    getClient<T>(key: T): SocketClient<T> | undefined;
    /**
     * get client by session id
     * @param id session id
     * @returns
     */
    getClientById(id: number): SocketClient<unknown> | undefined;
    /**
     * bind socketclient to user uuid
     * @param id
     * @param uid
     */
    bind(id: number, uid: string, roleid: string): void;
    hasClientFor(uid: string): boolean;
    getSessionId(uid: string): number;
}
