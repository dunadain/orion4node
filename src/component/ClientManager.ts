import { WsClient } from '../transport/WsClient';
import { Component } from './Component';

export class ClientManager extends Component {
    private map = new Map<unknown, WsClient>();
    private uuid2Client = new Map<string, WsClient>();

    addClient(nativeSocket: unknown, client: WsClient) {
        this.map.set(nativeSocket, client);
        this.uuid2Client.set(client.uuidForUser, client);
    }

    removeClient(nativeSocket: unknown) {
        const client = this.map.get(nativeSocket);
        if (client) {
            this.uuid2Client.delete(client.uuidForUser);
            this.map.delete(nativeSocket);
        }
    }

    removeClientByUuid(uuid: string) {
        const client = this.uuid2Client.get(uuid);
        if (client) {
            this.map.delete(client.socket);
            this.uuid2Client.delete(uuid);
        }
    }

    getClient(socket: unknown) {
        return this.map.get(socket);
    }

    getClientByUuid(uuid: string) {
        return this.uuid2Client.get(uuid);
    }

    hasClientFor(uuid: string) {
        return this.uuid2Client.has(uuid);
    }
}