"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Server_1 = require("../../src/server/Server");
const UWebSocketTransport_1 = require("../../src/transport/uws/UWebSocketTransport");
const NatsComponent_1 = require("../../src/nats/NatsComponent");
const Router_1 = require("../../src/router/Router");
const S2CSubscriber_1 = require("../../src/router/subscribers/S2CSubscriber");
const ClientManager_1 = require("../../src/component/ClientManager");
let server;
const id1 = 1;
(0, globals_1.beforeEach)(async () => {
    server = new Server_1.Server('connector', id1);
    server.addComponent(UWebSocketTransport_1.UWebSocketTransport);
    const transport = server.getComponent(UWebSocketTransport_1.UWebSocketTransport);
    if (transport)
        transport.port = 9008;
    server.addComponent(ClientManager_1.ClientManager);
    server.addComponent(NatsComponent_1.NatsComponent);
    server.addComponent(Router_1.Router);
    server.addComponent(S2CSubscriber_1.S2CSubscriber);
    try {
        await server.start();
    }
    catch (reason) {
        console.error(reason);
    }
});
(0, globals_1.afterEach)(() => {
    globals_1.jest.restoreAllMocks();
    globals_1.jest.clearAllMocks();
});
(0, globals_1.describe)('server shut down', () => {
    (0, globals_1.test)('shut down should not reject', async () => {
        await (0, globals_1.expect)(server.shutdown()).resolves.toBeUndefined();
    });
    (0, globals_1.test)('shut down should reject', async () => {
        const natsComponent = server.getComponent(NatsComponent_1.NatsComponent);
        if (!natsComponent)
            return;
        globals_1.jest
            .spyOn(natsComponent, 'dispose')
            .mockRejectedValue(new Error('nats error'));
        await (0, globals_1.expect)(server.shutdown()).rejects.toThrowError('some components failed to dispose');
        await natsComponent.nc?.drain();
    });
    (0, globals_1.describe)('kill process', () => {
        (0, globals_1.it)('should call process.exit(0)', async () => {
            const mockExit = globals_1.jest
                .spyOn(process, 'exit')
                .mockImplementation(() => undefined);
            const mockShutdown = globals_1.jest.spyOn(server, 'shutdown');
            process.emit('SIGTERM');
            await (0, globals_1.expect)(mockShutdown.mock.results[0].value).resolves.toBeUndefined();
            (0, globals_1.expect)(mockExit).toBeCalledWith(0);
        });
        (0, globals_1.it)('should call process.exit(1) when there are errors in dispose', async () => {
            const mockExit = globals_1.jest
                .spyOn(process, 'exit')
                .mockImplementation(() => undefined);
            const mockShutdown = globals_1.jest
                .spyOn(server, 'shutdown')
                .mockRejectedValue(new Error('some components failed to dispose'));
            process.emit('SIGTERM');
            await (0, globals_1.expect)(mockShutdown.mock.results[0].value).rejects.toThrowError('some components failed to dispose');
            (0, globals_1.expect)(mockExit).toBeCalledWith(1);
            mockShutdown.mockRestore();
            server.shutdown();
        });
    });
});
