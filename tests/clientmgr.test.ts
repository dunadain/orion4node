import { beforeAll, describe, expect, test } from '@jest/globals';
import { Server } from '../src/server/Server';
import { ClientManager } from '../src/component/ClientManager';
import { WsClient } from '../src/transport/WsClient';

let server: Server;
let mgr: ClientManager;
let fakeNativeSocket: any;
let fakeClient: WsClient;
let fakeNativeSocket2: any;
let fakeClient2: WsClient;
beforeAll(() => {
    server = new Server('', 0);
    mgr = server.addComponent(ClientManager);
    fakeNativeSocket = {};
    fakeClient = { uuidForUser: '1', socket: fakeNativeSocket } as WsClient;
    fakeNativeSocket2 = {};
    fakeClient2 = { uuidForUser: '2', socket: fakeNativeSocket2 } as WsClient;
});

describe('ClientManager Crud functions', () => {
    test('add', () => {
        mgr.addClient(fakeNativeSocket, fakeClient);
        expect((mgr as any).map.size).toBe(1);
        expect((mgr as any).uuid2Client.size).toBe(1);
        expect(mgr.hasClientFor('1')).toBeTruthy();
        mgr.addClient(fakeNativeSocket2, fakeClient2);
        expect((mgr as any).map.size).toBe(2);
        expect((mgr as any).uuid2Client.size).toBe(2);
        expect(mgr.hasClientFor('2')).toBeTruthy();
    });

    test('fetch', () => {
        expect(mgr.getClient(fakeNativeSocket)).not.toBeUndefined();
        expect(mgr.getClientByUuid('2')).not.toBeUndefined();
    });

    test('remove', () => {
        mgr.removeClient(fakeNativeSocket);
        expect((mgr as any).map.size).toBe(1);
        expect((mgr as any).uuid2Client.size).toBe(1);
        expect(mgr.hasClientFor('1')).toBeFalsy();
        expect(mgr.hasClientFor('2')).toBeTruthy();
        mgr.removeClientByUuid('2');
        expect((mgr as any).map.size).toBe(0);
        expect((mgr as any).uuid2Client.size).toBe(0);
        expect(mgr.hasClientFor('1')).toBeFalsy();
        expect(mgr.hasClientFor('2')).toBeFalsy();
    });
});