import { beforeAll, describe, expect, test } from '@jest/globals';
import { Server } from '../src/server/Server.mjs';
import { ClientManager } from '../src/component/ClientManager.mjs';
import type { SocketClient } from '../src/transport/SocketClient.mjs';

let server: Server;
let mgr: ClientManager;
let fakeNativeSocket: unknown;
let fakeClient: SocketClient<any>;
let fakeNativeSocket2: unknown;
let fakeClient2: SocketClient<any>;
beforeAll(() => {
    server = new Server('connector', 111);
    mgr = server.addComponent(ClientManager);
    fakeNativeSocket = {};
    fakeClient = {
        socket: fakeNativeSocket,
        uid: '',
    } as SocketClient<any>;
    fakeNativeSocket2 = {};
    fakeClient2 = {
        socket: fakeNativeSocket2,
        uid: '',
    } as SocketClient<any>;
});

describe('ClientManager Crud functions', () => {
    test('add', () => {
        mgr.addClient(fakeClient);
        expect((mgr as any).map.size).toBe(1);
        expect((mgr as any).id2Client.size).toBe(1);
        expect(fakeClient.id).toBe(1);
        mgr.addClient(fakeClient2);
        expect((mgr as any).map.size).toBe(2);
        expect((mgr as any).id2Client.size).toBe(2);
        expect(fakeClient2.id).toBe(2);
        expect((mgr as any).bindedClientMap.size).toBe(0);
    });

    test('bind', () => {
        mgr.bind(1, 'a', 'roleid1234');
        expect((mgr as any).map.size).toBe(2);
        expect((mgr as any).id2Client.size).toBe(2);
        expect((mgr as any).bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('a')).toBeTruthy();
        expect(mgr.hasClientFor('b')).toBeFalsy();

        mgr.bind(2, 'a', 'roleid1234');
        expect((mgr as any).bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.getClientById(2)?.uid).toBe('');
        expect(mgr.getClientById(1)?.uid).toBe('a');

        mgr.bind(1, 'b', 'roleid1234');
        expect((mgr as any).bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.getClientById(2)?.uid).toBe('');
        expect(mgr.getClientById(1)?.uid).toBe('a');

        mgr.bind(2, 'b', 'roleid1234');
        expect((mgr as any).bindedClientMap.size).toBe(2);
        expect(mgr.hasClientFor('b')).toBeTruthy();
    });

    test('fetch', () => {
        expect(mgr.getClient(fakeNativeSocket)).not.toBeUndefined();
        expect(mgr.getClientById(2)).not.toBeUndefined();
    });

    test('get session id', () => {
        expect(mgr.getSessionId('a')).toBeGreaterThanOrEqual(0);
        expect(mgr.getSessionId('wekrj')).toBe(0);
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
        expect((mgr as any).idGenerator).toBe(0);
    });
});
