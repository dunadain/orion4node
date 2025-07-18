import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server.mjs';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport.mjs';
import { NatsComponent } from '../../src/nats/NatsComponent.mjs';
import { Router } from '../../src/router/Router.mjs';
import { S2CSubscriber } from '../../src/router/subscribers/S2CSubscriber.mjs';
import { ClientManager } from '../../src/component/ClientManager.mjs';

let server: Server;
const id1 = '1';

beforeEach(async () => {
    server = new Server('connector', id1);
    server.addComponent(UWebSocketTransport);
    const transport = server.getComponent(UWebSocketTransport);
    if (transport) transport.port = 9008;
    server.addComponent(ClientManager);
    server.addComponent(Router);
    server.addComponent(S2CSubscriber);
    server.addComponent(NatsComponent);
    try {
        await server.start();
    } catch (reason) {
        console.error(reason);
    }
});
afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
});

describe('server shut down', () => {
    test('shut down should not reject', async () => {
        await expect(server.shutdown()).resolves.toBeUndefined();
    });
    test('shut down should reject', async () => {
        const natsComponent = server.getComponent(NatsComponent);
        if (!natsComponent) return;
        jest.spyOn(natsComponent, 'dispose').mockRejectedValue(new Error('nats error'));
        await expect(server.shutdown()).rejects.toThrow('some components failed to dispose');
        await natsComponent.nc?.drain();
    });

    describe('kill process', () => {
        it('should call process.exit(0)', async () => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const mockShutdown = jest.spyOn(server, 'shutdown');
            process.emit('SIGTERM');
            await expect(mockShutdown.mock.results[0].value).resolves.toBeUndefined();
            expect(mockExit).toHaveBeenCalledWith(0);
        });

        it('should call process.exit(1) when there are errors in dispose', async () => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const mockShutdown = jest
                .spyOn(server, 'shutdown')
                .mockRejectedValue(new Error('some components failed to dispose'));
            process.emit('SIGTERM');
            await expect(mockShutdown.mock.results[0].value).rejects.toThrow('some components failed to dispose');
            expect(mockExit).toHaveBeenCalledWith(1);
            mockShutdown.mockRestore();
            server.shutdown();
        });
    });
});
