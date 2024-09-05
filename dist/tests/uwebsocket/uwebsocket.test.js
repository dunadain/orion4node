/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest, test, } from '@jest/globals';
import { Server } from '../../src/server/Server.mjs';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport.mjs';
import { WebSocket } from 'ws';
import { ClientManager } from '../../src/component/ClientManager.mjs';
import * as packUtil from '../../src/transport/protocol/PacketProcessor.mjs';
import { ClientState } from '../../src/transport/SocketClient.mjs';
import { ErrorCode } from '../../src/config/ErrorCode.mjs';
import { HandShake } from '../../src/transport/handlers/HandShake.mjs';
import { netConfig } from '../../src/config/NetConfig.mjs';
import { createConnection } from '../utils/testUtils.mjs';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor.mjs';
import { Router } from '../../src/router/Router.mjs';
import { NatsComponent } from '../../src/nats/NatsComponent.mjs';
const port = 9009;
let server;
beforeAll(async () => {
    server = new Server('connector', 111);
    server.addComponent(UWebSocketTransport);
    const transport = server.getComponent(UWebSocketTransport);
    if (transport)
        transport.port = port;
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    try {
        await server.start();
    }
    catch (reason) {
        console.error(reason);
    }
});
afterAll(() => {
    server.shutdown();
});
describe('connection test', () => {
    test('server connect', () => {
        let socket;
        return new Promise((resolve) => {
            socket = new WebSocket(`ws://localhost:${port.toString()}`);
            const mockOpen = jest.fn(() => {
                resolve(mockOpen);
            });
            socket.onopen = mockOpen;
        }).then((mockOpen) => {
            expect(mockOpen.mock.calls).toHaveLength(1);
            const clientMgr = server.getComponent(ClientManager);
            expect(clientMgr.map.size).toBe(1);
            socket.close();
        });
    });
    test('multiple connections', async () => {
        const p = [];
        for (let i = 0; i < 10; ++i) {
            p.push(createConnection(port));
        }
        const arr = await Promise.all(p);
        const clientMgr = server.getComponent(ClientManager);
        expect(clientMgr.id2Client.size).toBe(10);
        expect(clientMgr.map.size).toBe(10);
        expect(clientMgr.idGenerator).toBe(10);
        clientMgr.id2Client.forEach((client) => {
            expect(client.state).toBe(ClientState.Ready);
        });
        for (const ws of arr) {
            ws.close();
        }
    });
});
describe('handshake test', () => {
    let socket;
    beforeEach(() => {
        return new Promise((resolve) => {
            socket = new WebSocket(`ws://localhost:${port.toString()}`);
            socket.onopen = () => {
                resolve();
            };
        });
    });
    afterEach(() => {
        delete HandShake.prototype.checkClient;
        socket.close();
        socket = undefined;
    });
    test('handshake normal', () => {
        const clientMgr = server.getComponent(ClientManager);
        const uwsClient = clientMgr?.getClientById(1);
        const mockHandshakeHandle = jest.fn(uwsClient.handlers.get(packUtil.PackType.HANDSHAKE).handle);
        const mockHandshakeAckHandle = jest.fn(uwsClient.handlers.get(packUtil.PackType.HANDSHAKE_ACK).handle);
        uwsClient.handlers.get(packUtil.PackType.HANDSHAKE).handle =
            mockHandshakeHandle;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const mockWsSend = jest.fn(socket.send);
        socket.send = mockWsSend;
        const packs = [];
        const mockOnMsg = jest.fn((e) => {
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
                    expect(obj.code).not.toBeNaN();
                    expect(obj.msg).not.toBeUndefined();
                }
            }
        });
        return new Promise((resolve) => {
            const handler = uwsClient.handlers.get(packUtil.PackType.HANDSHAKE_ACK);
            handler.handle = () => {
                expect(uwsClient.state).toBe(ClientState.WaitForAck);
                mockHandshakeAckHandle.bind(handler)();
                expect(uwsClient.state).toBe(ClientState.Ready);
                resolve();
            };
            socket.onmessage = mockOnMsg;
            socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } }))));
        }).then(() => {
            expect(mockHandshakeAckHandle.mock.calls).toHaveLength(1);
            expect(packs[0].type).toBe(packUtil.PackType.HANDSHAKE);
            expect(packs[0].body.sys.heartbeat).not.toBeNaN();
            expect(mockHandshakeHandle).toHaveBeenCalledTimes(1);
            expect(mockHandshakeAckHandle).toHaveBeenCalledTimes(1);
            expect(mockWsSend).toBeCalledTimes(2);
        });
    });
    it('s message should contain sys', () => {
        return testHandshakeErr({}, ErrorCode.InvaildHandShakeInfo, socket);
    });
    test('handshake info parsing error', () => {
        return testHandshakeErr({}, ErrorCode.InvaildHandShakeInfo, socket);
    });
    test('outdated client', () => {
        HandShake.prototype.checkClient = (ver) => {
            return ver > '1.1.0';
        };
        return testHandshakeErr({ sys: { ver: '1.0.0' } }, ErrorCode.OutdatedClient, socket);
    });
});
describe('heartbeat test', () => {
    let socket;
    beforeEach(() => {
        const clientMgr = server.getComponent(ClientManager);
        clientMgr.id2Client.clear();
        clientMgr.map.clear();
        clientMgr.idGenerator = 0;
        netConfig.heartbeatTimeout = 500;
        netConfig.heartbeatInterval = 300;
        return new Promise((resolve) => {
            socket = new WebSocket(`ws://localhost:${port.toString()}`);
            socket.onopen = () => {
                resolve();
            };
        });
    });
    afterEach(() => {
        socket.close();
        netConfig.heartbeatTimeout = 40000;
        netConfig.heartbeatInterval = 20000;
        socket = undefined;
    });
    test('handshake timeout', () => {
        const clientMgr = server.getComponent(ClientManager);
        expect(clientMgr.id2Client.size).toBe(1);
        expect(clientMgr.map.size).toBe(1);
        expect(clientMgr.idGenerator).toBe(1);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, netConfig.heartbeatTimeout * 2);
        }).then(() => {
            expect(clientMgr.id2Client.size).toBe(0);
            expect(clientMgr.map.size).toBe(0);
            expect(clientMgr.idGenerator).toBe(0);
        });
    });
    test('heartbeat timeout', () => {
        const clientMgr = server.getComponent(ClientManager);
        expect(clientMgr.id2Client.size).toBe(1);
        expect(clientMgr.map.size).toBe(1);
        expect(clientMgr.idGenerator).toBe(1);
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
            expect(clientMgr.id2Client.size).toBe(0);
            expect(clientMgr.map.size).toBe(0);
            expect(clientMgr.idGenerator).toBe(0);
        });
    });
});
function testHandshakeErr(handshakeMsg, errCode, socket) {
    return new Promise((resolve) => {
        const mockOnMsg = jest.fn((e) => {
            const buffer = Buffer.from(e.data);
            const pkgs = packUtil.decode(buffer);
            if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
            }
            else if (pkgs[0].type === packUtil.PackType.ERROR) {
                if (pkgs[0].body) {
                    const obj = JSON.parse(pkgs[0].body.toString());
                    expect(obj.code).toBe(errCode);
                    expect(obj.msg).not.toBeUndefined();
                    resolve();
                }
            }
        });
        socket.onmessage = mockOnMsg;
        socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify(handshakeMsg))));
    });
}
describe('sending messages', () => {
    let socket;
    beforeEach(async () => {
        const result = {};
        const p = createConnection(port, result);
        socket = result.socket;
        await p;
    });
    afterEach(() => {
        socket.close();
    });
    test('client send msg', () => {
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        const reqId = 234;
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
            expect(msg.msg.id).toBe(reqId);
            expect(msg.msg.protoId).toBe(route);
            const body = JSON.parse(msg.msg.body.toString());
            for (const k in body) {
                expect(body[k]).toBe(data[k]);
            }
        });
    });
    test('server sending messages', () => {
        const reqId = 0xff;
        const route = 7899;
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        return new Promise((resolve) => {
            const clientMgr = server.getComponent(ClientManager);
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
            expect(msg.route).toBe(route);
            for (const k in msg.body) {
                expect(msg.body[k]).toBe(data[k]);
            }
        });
    });
});
