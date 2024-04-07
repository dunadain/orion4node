import { beforeAll, describe, expect, test } from '@jest/globals';
import { Server } from '../src/server/Server';
import { ClientManager } from '../src/component/ClientManager';
import { SocketClient } from '../src/transport/WsClient';

let server: Server;
let mgr: ClientManager;
let fakeNativeSocket: unknown;
let fakeClient: SocketClient<any>;
let fakeNativeSocket2: unknown;
let fakeClient2: SocketClient<any>;
beforeAll(() => {
    server = new Server('', 0);
    mgr = server.addComponent(ClientManager);
    fakeNativeSocket = {};
    fakeClient = { socket: fakeNativeSocket, id: 1 } as SocketClient<any>;
    fakeNativeSocket2 = {};
    fakeClient2 = { socket: fakeNativeSocket2, id: 2 } as SocketClient<any>;
});

describe('ClientManager Crud functions', () => {
    test('add', () => {
        mgr.addClient(fakeClient);
        expect((mgr as any).map.size).toBe(1);
        expect((mgr as any).id2Client.size).toBe(1);
        mgr.addClient(fakeClient2);
        expect((mgr as any).map.size).toBe(2);
        expect((mgr as any).id2Client.size).toBe(2);
        expect((mgr as any).bindedClientMap.size).toBe(0);
    });

    test('bind', () => {
        mgr.bind(1, 'a');
        expect((mgr as any).map.size).toBe(2);
        expect((mgr as any).id2Client.size).toBe(2);
        expect((mgr as any).bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('a')).toBeTruthy();
        expect(mgr.hasClientFor('b')).toBeFalsy();
        mgr.bind(2, 'b');
        expect((mgr as any).bindedClientMap.size).toBe(2);
        expect(mgr.hasClientFor('b')).toBeTruthy();
    });

    test('fetch', () => {
        expect(mgr.getClient(fakeNativeSocket)).not.toBeUndefined();
        expect(mgr.getClientById(2)).not.toBeUndefined();
    });

    test('remove', () => {
        mgr.removeClient(fakeNativeSocket);
        expect((mgr as any).map.size).toBe(1);
        expect((mgr as any).id2Client.size).toBe(1);
        expect((mgr as any).bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('a')).toBeFalsy();
        expect(mgr.hasClientFor('b')).toBeTruthy();
        mgr.removeClient(2);
        expect((mgr as any).map.size).toBe(0);
        expect((mgr as any).id2Client.size).toBe(0);
        expect((mgr as any).bindedClientMap.size).toBe(0);
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.hasClientFor('b')).toBeFalsy();
    });
});