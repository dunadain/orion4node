import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { PushSubscriber } from '../../src/router/subscribers/PushSubscriber';
import { ClientManager } from '../../src/component/ClientManager';

let server: Server;
const id1 = '1';

describe('server shut down', () => {
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
        jest.clearAllMocks();
    });
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
    test('shut down with SIGTERM', () => {
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit');
        });
        process.emit('SIGTERM');
        expect(mockExit).toBeCalledWith(0);
    });
});
