/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { MessageEvent, WebSocket } from 'ws';
import { ClientManager } from '../../src/component/ClientManager';
import * as packUtil from '../../src/transport/protocol/PacketProcessor';
import { ClientState } from '../../src/transport/SocketClient';
import { ErrorCode } from '../../src/config/ErrorCode';
import { HandShake } from '../../src/transport/handlers/HandShake';
import { netConfig } from '../../src/config/NetConfig';
import { createConnection } from '../testUtils';
import * as msgUtil from '../../src/transport/protocol/MsgProcessor';
import { RouterComponent } from '../../src/component/RouterComponent';

const port = 9001;
let server: Server;
beforeEach(async () => {
    server = new Server('', port, 'connector');
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(RouterComponent);
    try {
        await server.start();
    } catch (reason) {
        console.error(reason);
    }
});

afterEach(() => {
    server.shutdown();
});

describe('connection test', () => {
    test('server connect', () => {
        let socket: WebSocket;
        return new Promise<any>((resolve) => {
            socket = new WebSocket(`ws://localhost:${port.toString()}`);
            const mockOpen = jest.fn(() => {
                resolve(mockOpen);
            });
            socket.onopen = mockOpen;
        }).then((mockOpen) => {
            expect(mockOpen.mock.calls).toHaveLength(1);
            const clientMgr = server.getComponent(ClientManager);
            expect((clientMgr as any).map.size).toBe(1);
            socket.close();
        });
    });
});

describe('handshake test', () => {
    let socket: WebSocket;
    beforeEach(() => {
        return new Promise<void>((resolve) => {
            socket = new WebSocket(`ws://localhost:${port.toString()}`);
            socket.onopen = () => {
                resolve();
            };
        });
    });

    afterEach(() => {
        delete HandShake.prototype.checkClient;
        socket.close();
        (socket as any) = undefined;
    });

    test('handshake normal', () => {
        const clientMgr = server.getComponent(ClientManager);
        const uwsClient = clientMgr?.getClientById(1) as any;
        const mockHandshakeHandle = jest.fn(uwsClient.handlers.get(packUtil.PackType.HANDSHAKE).handle);
        const mockHandshakeAckHandle = jest.fn(uwsClient.handlers.get(packUtil.PackType.HANDSHAKE_ACK).handle);
        uwsClient.handlers.get(packUtil.PackType.HANDSHAKE).handle = mockHandshakeHandle;

        // eslint-disable-next-line @typescript-eslint/unbound-method
        const mockWsSend = jest.fn(socket.send);
        (socket as any).send = mockWsSend;

        const packs: any[] = [];
        const mockOnMsg = jest.fn((e: MessageEvent) => {
            const buffer = Buffer.from(e.data as ArrayBuffer);
            const pkgs = packUtil.decode(buffer);
            for (const pkg of pkgs) {
                packs.push({
                    type: pkg.type,
                    body: pkg.body ? JSON.parse(pkg.body.toString()) : undefined,
                });
            }
            if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
            } else if (pkgs[0].type === packUtil.PackType.ERROR) {
                if (pkgs[0].body) {
                    const obj = JSON.parse(pkgs[0].body.toString());
                    expect(obj.code).not.toBeNaN();
                    expect(obj.msg).not.toBeUndefined();
                }
            }
        });
        return new Promise<void>((resolve) => {
            const handler = uwsClient.handlers.get(packUtil.PackType.HANDSHAKE_ACK);
            handler.handle = () => {
                expect(uwsClient.state).toBe(ClientState.WaitForAck);
                mockHandshakeAckHandle.bind(handler)();
                expect(uwsClient.state).toBe(ClientState.Ready);
                resolve();
            };

            socket.onmessage = mockOnMsg;
            socket.send(
                packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } })))
            );
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
        HandShake.prototype.checkClient = (ver: string) => {
            return ver > '1.1.0';
        };
        return testHandshakeErr({ sys: { ver: '1.0.0' } }, ErrorCode.OutdatedClient, socket);
    });
});

describe('multiple connections', () => {
    test('test connections', () => {
        const p: Promise<void>[] = [];
        for (let i = 0; i < 10; ++i) {
            p.push(createConnection(port));
        }
        return Promise.all(p).then(() => {
            const clientMgr = server.getComponent(ClientManager);
            expect((clientMgr as any).id2Client.size).toBe(10);
            expect((clientMgr as any).map.size).toBe(10);
            expect((clientMgr as any).idGenerator).toBe(10);
            (clientMgr as any).id2Client.forEach((client: any) => {
                expect(client.state).toBe(ClientState.Ready);
            });
        });
    });
});

describe('heartbeat test', () => {
    let socket: WebSocket;
    beforeEach(() => {
        const clientMgr = server.getComponent(ClientManager);
        (clientMgr as any).id2Client.clear();
        (clientMgr as any).map.clear();
        (clientMgr as any).idGenerator = 0;
        netConfig.heartbeatTimeout = 500;
        netConfig.heartbeatInterval = 300;
        return new Promise<void>((resolve) => {
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
        (socket as any) = undefined;
    });

    test('handshake timeout', () => {
        const clientMgr = server.getComponent(ClientManager);
        expect((clientMgr as any).id2Client.size).toBe(1);
        expect((clientMgr as any).map.size).toBe(1);
        expect((clientMgr as any).idGenerator).toBe(1);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, netConfig.heartbeatTimeout * 2);
        }).then(() => {
            expect((clientMgr as any).id2Client.size).toBe(0);
            expect((clientMgr as any).map.size).toBe(0);
            expect((clientMgr as any).idGenerator).toBe(0);
        });
    });

    test('heartbeat timeout', () => {
        const clientMgr = server.getComponent(ClientManager);
        expect((clientMgr as any).id2Client.size).toBe(1);
        expect((clientMgr as any).map.size).toBe(1);
        expect((clientMgr as any).idGenerator).toBe(1);
        return new Promise<void>((resolve) => {
            socket.onmessage = (e: MessageEvent) => {
                const buffer = Buffer.from(e.data as ArrayBuffer);
                const pkgs = packUtil.decode(buffer);
                if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                    socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const obj = JSON.parse(pkgs[0].body!.toString());
                    setTimeout(() => {
                        socket.send(packUtil.encode(packUtil.PackType.HEARTBEAT));
                        setTimeout(() => {
                            resolve();
                        }, obj.sys.heartbeat * 2);
                    }, obj.sys.heartbeat);
                }
            };
            socket.send(
                packUtil.encode(packUtil.PackType.HANDSHAKE, Buffer.from(JSON.stringify({ sys: { ver: '1.0.0' } })))
            );
        }).then(() => {
            expect((clientMgr as any).id2Client.size).toBe(0);
            expect((clientMgr as any).map.size).toBe(0);
            expect((clientMgr as any).idGenerator).toBe(0);
        });
    });
});

function testHandshakeErr(handshakeMsg: any, errCode: ErrorCode, socket: WebSocket) {
    return new Promise<void>((resolve) => {
        const mockOnMsg = jest.fn((e: MessageEvent) => {
            const buffer = Buffer.from(e.data as ArrayBuffer);
            const pkgs = packUtil.decode(buffer);

            if (pkgs[0].type === packUtil.PackType.HANDSHAKE) {
                socket.send(packUtil.encode(packUtil.PackType.HANDSHAKE_ACK));
            } else if (pkgs[0].type === packUtil.PackType.ERROR) {
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
    let socket: WebSocket;
    beforeEach(async () => {
        const result: any = {};
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
        const reqId = 2344;
        const route = 52;
        return new Promise<any>((resolve) => {
            server.eventEmitter.on('message', (msg) => {
                resolve(msg);
            });

            const encodedMsg = msgUtil.encode(
                reqId,
                msgUtil.MsgType.REQUEST,
                route,
                Buffer.from(JSON.stringify(data), 'utf8')
            );
            const pkg = packUtil.encode(packUtil.PackType.DATA, encodedMsg);
            socket.send(pkg);
        }).then((msg) => {
            expect(msg.id).toBe(reqId);
            expect(msg.route).toBe(route);
            for (const k in msg.body) {
                expect(msg.body[k]).toBe((data as any)[k]);
            }
        });
    });

    test('server sending messages', () => {
        const reqId = 2332;
        const route = 7899;
        const data = {
            a: 1,
            b: '223d',
            c: true,
            dsldksdjfk: '$$####asfdjal',
        };
        return new Promise<any>((resolve) => {
            const clientMgr = server.getComponent(ClientManager);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const uwsClient = clientMgr!.getClientById(1)!;
            socket.onmessage = (e: MessageEvent) => {
                const buffer = Buffer.from(e.data as ArrayBuffer);
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
            uwsClient.sendMsg(msgUtil.MsgType.PUSH, route, data, reqId);
        }).then((msg) => {
            expect(msg.route).toBe(route);
            for (const k in msg.body) {
                expect(msg.body[k]).toBe((data as any)[k]);
            }
        });
    });
});
