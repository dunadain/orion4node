import { beforeAll, describe, expect, test } from '@jest/globals';
import { Server } from '../src/server/Server.mjs';
import { ClientManager } from '../src/component/ClientManager.mjs';
let server;
let mgr;
let fakeNativeSocket;
let fakeClient;
let fakeNativeSocket2;
let fakeClient2;
beforeAll(() => {
    server = new Server('connector', 111);
    mgr = server.addComponent(ClientManager);
    fakeNativeSocket = {};
    fakeClient = {
        socket: fakeNativeSocket,
        uid: '',
    };
    fakeNativeSocket2 = {};
    fakeClient2 = {
        socket: fakeNativeSocket2,
        uid: '',
    };
});
describe('ClientManager Crud functions', () => {
    test('add', () => {
        mgr.addClient(fakeClient);
        expect(mgr.map.size).toBe(1);
        expect(mgr.id2Client.size).toBe(1);
        expect(fakeClient.id).toBe(1);
        mgr.addClient(fakeClient2);
        expect(mgr.map.size).toBe(2);
        expect(mgr.id2Client.size).toBe(2);
        expect(fakeClient2.id).toBe(2);
        expect(mgr.bindedClientMap.size).toBe(0);
    });
    test('bind', () => {
        mgr.bind(1, 'a');
        expect(mgr.map.size).toBe(2);
        expect(mgr.id2Client.size).toBe(2);
        expect(mgr.bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('a')).toBeTruthy();
        expect(mgr.hasClientFor('b')).toBeFalsy();
        mgr.bind(2, 'a');
        expect(mgr.bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.getClientById(2)?.uid).toBe('');
        expect(mgr.getClientById(1)?.uid).toBe('a');
        mgr.bind(1, 'b');
        expect(mgr.bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.getClientById(2)?.uid).toBe('');
        expect(mgr.getClientById(1)?.uid).toBe('a');
        mgr.bind(2, 'b');
        expect(mgr.bindedClientMap.size).toBe(2);
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
        expect(mgr.map.size).toBe(1);
        expect(mgr.id2Client.size).toBe(1);
        expect(mgr.bindedClientMap.size).toBe(1);
        expect(mgr.hasClientFor('a')).toBeFalsy();
        expect(mgr.hasClientFor('b')).toBeTruthy();
        mgr.removeClient(2);
        expect(mgr.map.size).toBe(0);
        expect(mgr.id2Client.size).toBe(0);
        expect(mgr.bindedClientMap.size).toBe(0);
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.hasClientFor('b')).toBeFalsy();
        expect(mgr.idGenerator).toBe(0);
    });
});
