"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const globals_1 = require("@jest/globals");
const Server_1 = require("../../src/server/Server");
const UWebSocketTransport_1 = require("../../src/transport/uws/UWebSocketTransport");
const ws_1 = require("ws");
const ClientManager_1 = require("../../src/component/ClientManager");
const packUtil = __importStar(require("../../src/transport/protocol/PacketProcessor"));
const SocketClient_1 = require("../../src/transport/SocketClient");
const ErrorCode_1 = require("../../src/config/ErrorCode");
const HandShake_1 = require("../../src/transport/handlers/HandShake");
const NetConfig_1 = require("../../src/config/NetConfig");
const testUtils_1 = require("../utils/testUtils");
const msgUtil = __importStar(require("../../src/transport/protocol/MsgProcessor"));
const Router_1 = require("../../src/router/Router");
const NatsComponent_1 = require("../../src/nats/NatsComponent");
const port = 9009;
let server;
(0, globals_1.beforeAll)(async () => {
    server = new Server_1.Server('', port, 'connector', '111');
    server.addComponent(UWebSocketTransport_1.UWebSocketTransport);
    server.addComponent(ClientManager_1.ClientManager);
    server.addComponent(NatsComponent_1.NatsComponent);
    server.addComponent(Router_1.Router);
    try {
        await server.start();
    }
    catch (reason) {
        console.error(reason);
    }
});
(0, globals_1.afterAll)(() => {
    server.shutdown();
});
(0, globals_1.describe)('connection test', () => {
    (0, globals_1.test)('server connect', () => {
        let socket;
        return new Promise((resolve) => {
            socket = new ws_1.WebSocket(`ws://localhost:${port.toString()}`);
            const mockOpen = globals_1.jest.fn(() => {
                resolve(mockOpen);
            });
            socket.onopen = mockOpen;
        }).then((mockOpen) => {
            (0, globals_1.expect)(mockOpen.mock.calls).toHaveLength(1);
            const clientMgr = server.getComponent(ClientManager_1.ClientManager);
            (0, globals_1.expect)(clientMgr.map.size).toBe(1);
            socket.close();
        });
    });
    (0, globals_1.test)('multiple connections', async () => {
        const p = [];
        for (let i = 0; i < 10; ++i) {
            p.push((0, testUtils_1.createConnection)(port));
        }
        const arr = await Promise.all(p);
        const clientMgr = server.getComponent(ClientManager_1.ClientManager);
        (0, globals_1.expect)(clientMgr.id2Client.size).toBe(10);
        (0, globals_1.expect)(clientMgr.map.size).toBe(10);
        (0, globals_1.expect)(clientMgr.idGenerator).toBe(10);
        clientMgr.id2Client.forEach((client) => {
            (0, globals_1.expect)(client.state).toBe(SocketClient_1.ClientState.Ready);
        });
        for (const ws of arr) {
            ws.close();
        }
    });
});
(0, globals_1.describe)('handshake test', () => {
    let socket;
    (0, globals_1.beforeEach)(() => {
        return new Promise((resolve) => {
            socket = new ws_1.WebSocket(`ws://localhost:${port.toString()}`);
            socket.onopen = () => {
                resolve();
            };
        });
    });
    (0, globals_1.afterEach)(() => {
        delete HandShake_1.HandShake.prototype.checkClient;
        socket.close();
        socket = undefined;
    });
    (0, globals_1.test)('handshake normal', () => {
        const clientMgr = server.getComponent(ClientManager_1.ClientManager);
        const uwsClient = clientMgr?.getClientById(1);
        const mockHandshakeHandle = globals_1.jest.fn(uwsClient.handlers.get(packUtil.PackType.HANDSHAKE).handle);
        const mockHandshakeAckHandle = globals_1.jest.fn(uwsClient.handlers.get(packUtil.PackType.HANDSHAKE_ACK).handle);
        uwsClient.handlers.get(packUtil.PackType.HANDSHAKE).handle = mockHandshakeHandle;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const mockWsSend = globals_1.jest.fn(socket.send);
        socket.send = mockWsSend;
        const packs = [];
        const mockOnMsg = globals_1.jest.fn((e) => {
            const buffer = Buffer.from(e.data);
            const pkgs = packUtil.decode(buffer);
            for (const pkg of pkgs) {
                packs.push({
                    type: pkg.type,
                    body: pkg.body ? JSON.parse(pkg.body.toString()) : undefined,
                });
            }
            if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
            }
            else if (pkgs[0].type === packUtil.PackType.ERROR) {
                if (pkgs[0].body) {
                    const obj = JSON.parse(pkgs[0].body.toString());
                    (0, globals_1.expect)(obj.code).not.toBeNaN();
                    (0, globals_1.expect)(obj.msg).not.toBeUndefined();
                }
            }
        });
        return new Promise((resolve) => {
            const handler = uwsClient.handlers.get(packUtil.PackType.HANDSHAKE_ACK);
            handler.handle = () => {
                (0, globals_1.expect)(uwsClient.state).toBe(SocketClient_1.ClientState.WaitForAck);
                mockHandshakeAckHandle.bind(handler)();
                (0, globals_1.expect)(uwsClient.state).toBe(SocketClient_1.ClientState.Ready);
                resolve();
            };
            socket.onmessage = mockOnMsg;
            socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } }))));
        }).then(() => {
            (0, globals_1.expect)(mockHandshakeAckHandle.mock.calls).toHaveLength(1);
            (0, globals_1.expect)(packs[0].type).toBe(packUtil.PackType.HANDSHAKE);
            (0, globals_1.expect)(packs[0].body.sys.heartbeat).not.toBeNaN();
            (0, globals_1.expect)(mockHandshakeHandle).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(mockHandshakeAckHandle).toHaveBeenCalledTimes(1);
            (0, globals_1.expect)(mockWsSend).toBeCalledTimes(2);
        });
    });
    (0, globals_1.it)('s message should contain sys', () => {
        return testHandshakeErr({}, ErrorCode_1.ErrorCode.InvaildHandShakeInfo, socket);
    });
    (0, globals_1.test)('handshake info parsing error', () => {
        return testHandshakeErr({}, ErrorCode_1.ErrorCode.InvaildHandShakeInfo, socket);
    });
    (0, globals_1.test)('outdated client', () => {
        HandShake_1.HandShake.prototype.checkClient = (ver) => {
            return ver > '1.1.0';
        };
        return testHandshakeErr({ sys: { ver: '1.0.0' } }, ErrorCode_1.ErrorCode.OutdatedClient, socket);
    });
});
(0, globals_1.describe)('heartbeat test', () => {
    let socket;
    (0, globals_1.beforeEach)(() => {
        const clientMgr = server.getComponent(ClientManager_1.ClientManager);
        clientMgr.id2Client.clear();
        clientMgr.map.clear();
        clientMgr.idGenerator = 0;
        NetConfig_1.netConfig.heartbeatTimeout = 500;
        NetConfig_1.netConfig.heartbeatInterval = 300;
        return new Promise((resolve) => {
            socket = new ws_1.WebSocket(`ws://localhost:${port.toString()}`);
            socket.onopen = () => {
                resolve();
            };
        });
    });
    (0, globals_1.afterEach)(() => {
        socket.close();
        NetConfig_1.netConfig.heartbeatTimeout = 40000;
        NetConfig_1.netConfig.heartbeatInterval = 20000;
        socket = undefined;
    });
    (0, globals_1.test)('handshake timeout', () => {
        const clientMgr = server.getComponent(ClientManager_1.ClientManager);
        (0, globals_1.expect)(clientMgr.id2Client.size).toBe(1);
        (0, globals_1.expect)(clientMgr.map.size).toBe(1);
        (0, globals_1.expect)(clientMgr.idGenerator).toBe(1);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, NetConfig_1.netConfig.heartbeatTimeout * 2);
        }).then(() => {
            (0, globals_1.expect)(clientMgr.id2Client.size).toBe(0);
            (0, globals_1.expect)(clientMgr.map.size).toBe(0);
            (0, globals_1.expect)(clientMgr.idGenerator).toBe(0);
        });
    });
    (0, globals_1.test)('heartbeat timeout', () => {
        const clientMgr = server.getComponent(ClientManager_1.ClientManager);
        (0, globals_1.expect)(clientMgr.id2Client.size).toBe(1);
        (0, globals_1.expect)(clientMgr.map.size).toBe(1);
        (0, globals_1.expect)(clientMgr.idGenerator).toBe(1);
        return new Promise((resolve) => {
            socket.onmessage = (e) => {
                const buffer = Buffer.from(e.data);
                const pkgs = packUtil.decode(buffer);
                if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                    socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const obj = JSON.parse(pkgs[0].body.toString());
                    setTimeout(() => {
                        socket.send(packUtil.encode(packUtil.PackType.HEARTBEAT));
                        setTimeout(() => {
                            resolve();
                        }, obj.sys.heartbeat * 2);
                    }, obj.sys.heartbeat);
                }
            };
            socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } }))));
        }).then(() => {
            (0, globals_1.expect)(clientMgr.id2Client.size).toBe(0);
            (0, globals_1.expect)(clientMgr.map.size).toBe(0);
            (0, globals_1.expect)(clientMgr.idGenerator).toBe(0);
        });
    });
});
function testHandshakeErr(handshakeMsg, errCode, socket) {
    return new Promise((resolve) => {
        const mockOnMsg = globals_1.jest.fn((e) => {
            const buffer = Buffer.from(e.data);
            const pkgs = packUtil.decode(buffer);
            if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
            }
            else if (pkgs[0].type === packUtil.PackType.ERROR) {
                if (pkgs[0].body) {
                    const obj = JSON.parse(pkgs[0].body.toString());
                    (0, globals_1.expect)(obj.code).toBe(errCode);
                    (0, globals_1.expect)(obj.msg).not.toBeUndefined();
                    resolve();
                }
            }
        });
        socket.onmessage = mockOnMsg;
        socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify(handshakeMsg))));
    });
}
(0, globals_1.describe)('sending messages', () => {
    let socket;
    (0, globals_1.beforeEach)(async () => {
        const result = {};
        const p = (0, testUtils_1.createConnection)(port, result);
        socket = result.socket;
        await p;
    });
    (0, globals_1.afterEach)(() => {
        socket.close();
    });
    (0, globals_1.test)('client send msg', () => {
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        const reqId = 2344;
        const route = 52;
        return new Promise((resolve) => {
            server.eventEmitter.removeAllListeners();
            server.eventEmitter.on('message', (msg) => {
                resolve(msg);
            });
            const encodedMsg = msgUtil.encode(reqId, msgUtil.MsgType.REQUEST, route, Buffer.from(JSON.stringify(data), 'utf8'));
            const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
            socket.send(pkg);
        }).then((msg) => {
            (0, globals_1.expect)(msg.msg.id).toBe(reqId);
            (0, globals_1.expect)(msg.msg.protoId).toBe(route);
            const body = JSON.parse(msg.msg.body.toString());
            for (const k in body) {
                (0, globals_1.expect)(body[k]).toBe(data[k]);
            }
        });
    });
    (0, globals_1.test)('server sending messages', () => {
        const reqId = 2332;
        const route = 7899;
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        return new Promise((resolve) => {
            const clientMgr = server.getComponent(ClientManager_1.ClientManager);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const uwsClient = clientMgr.getClientById(1);
            socket.onmessage = (e) => {
                const buffer = Buffer.from(e.data);
                const pkgs = packUtil.decode(buffer);
                if (pkgs[0].type === packUtil.PackType.DATA) {
                    if (pkgs[0].body) {
                        const decodedMsg = msgUtil.decode(pkgs[0].body);
                        const parsedObj = JSON.parse(decodedMsg.body.toString());
                        resolve({
                            id: decodedMsg.id,
                            route: decodedMsg.route,
                            body: parsedObj,
                        });
                    }
                }
            };
            const buffer = Buffer.from(JSON.stringify(data));
            uwsClient.sendMsg(msgUtil.MsgType.PUSH, route, buffer, reqId);
        }).then((msg) => {
            (0, globals_1.expect)(msg.route).toBe(route);
            for (const k in msg.body) {
                (0, globals_1.expect)(msg.body[k]).toBe(data[k]);
            }
        });
    });
});
