"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Server_1 = require("../src/server/Server");
const ClientManager_1 = require("../src/component/ClientManager");
let server;
let mgr;
let fakeNativeSocket;
let fakeClient;
let fakeNativeSocket2;
let fakeClient2;
(0, globals_1.beforeAll)(() => {
    server = new Server_1.Server('', 0, 'connector', '111');
    mgr = server.addComponent(ClientManager_1.ClientManager);
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
(0, globals_1.describe)('ClientManager Crud functions', () => {
    (0, globals_1.test)('add', () => {
        mgr.addClient(fakeClient);
        (0, globals_1.expect)(mgr.map.size).toBe(1);
        (0, globals_1.expect)(mgr.id2Client.size).toBe(1);
        (0, globals_1.expect)(fakeClient.id).toBe(1);
        mgr.addClient(fakeClient2);
        (0, globals_1.expect)(mgr.map.size).toBe(2);
        (0, globals_1.expect)(mgr.id2Client.size).toBe(2);
        (0, globals_1.expect)(fakeClient2.id).toBe(2);
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(0);
    });
    (0, globals_1.test)('bind', () => {
        mgr.bind(1, 'a');
        (0, globals_1.expect)(mgr.map.size).toBe(2);
        (0, globals_1.expect)(mgr.id2Client.size).toBe(2);
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(1);
        (0, globals_1.expect)(mgr.hasClientFor('a')).toBeTruthy();
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeFalsy();
        mgr.bind(2, 'a');
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(1);
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeFalsy();
        (0, globals_1.expect)(mgr.getClientById(2)?.uid).toBe('');
        (0, globals_1.expect)(mgr.getClientById(1)?.uid).toBe('a');
        mgr.bind(1, 'b');
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(1);
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeFalsy();
        (0, globals_1.expect)(mgr.getClientById(2)?.uid).toBe('');
        (0, globals_1.expect)(mgr.getClientById(1)?.uid).toBe('a');
        mgr.bind(2, 'b');
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(2);
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeTruthy();
    });
    (0, globals_1.test)('fetch', () => {
        (0, globals_1.expect)(mgr.getClient(fakeNativeSocket)).not.toBeUndefined();
        (0, globals_1.expect)(mgr.getClientById(2)).not.toBeUndefined();
    });
    (0, globals_1.test)('get session id', () => {
        (0, globals_1.expect)(mgr.getSessionId('a')).toBeGreaterThan(0);
        (0, globals_1.expect)(mgr.getSessionId('wekrj')).toBe(0);
    });
    (0, globals_1.test)('remove', () => {
        mgr.removeClient(fakeNativeSocket);
        (0, globals_1.expect)(mgr.map.size).toBe(1);
        (0, globals_1.expect)(mgr.id2Client.size).toBe(1);
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(1);
        (0, globals_1.expect)(mgr.hasClientFor('a')).toBeFalsy();
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeTruthy();
        mgr.removeClient(2);
        (0, globals_1.expect)(mgr.map.size).toBe(0);
        (0, globals_1.expect)(mgr.id2Client.size).toBe(0);
        (0, globals_1.expect)(mgr.bindedClientMap.size).toBe(0);
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeFalsy();
        (0, globals_1.expect)(mgr.hasClientFor('b')).toBeFalsy();
        (0, globals_1.expect)(mgr.idGenerator).toBe(0);
    });
});
