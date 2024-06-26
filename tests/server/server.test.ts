import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { PushSubscriber } from '../../src/router/subscribers/PushSubscriber';
import { ClientManager } from '../../src/component/ClientManager';

let server: Server;
const id1 = '1';

beforeEach(async () => {
    server = new Server('', 9008, 'connector', id1);
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    server.addComponent(PushSubscriber);
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
        await expect(server.shutdown()).rejects.toThrowError('some components failed to dispose');
        await natsComponent.nc?.drain();
    });

    describe('kill process', () => {
        it('should call process.exit(0)', async () => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const mockShutdown = jest.spyOn(server, 'shutdown');
            process.emit('SIGTERM');
            await expect(mockShutdown.mock.results[0].value).resolves.toBeUndefined();
            expect(mockExit).toBeCalledWith(0);
        });

        it('should call process.exit(1) when there are errors in dispose', async () => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const mockShutdown = jest
                .spyOn(server, 'shutdown')
                .mockRejectedValue(new Error('some components failed to dispose'));
            process.emit('SIGTERM');
            await expect(mockShutdown.mock.results[0].value).rejects.toThrowError('some components failed to dispose');
            expect(mockExit).toBeCalledWith(1);
            mockShutdown.mockRestore();
            server.shutdown();
        });
    });
});
