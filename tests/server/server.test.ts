import { beforeEach, describe, expect, test } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { PushSubscriber } from '../../src/router/subscribers/PushSubscriber';
import { ClientManager } from '../../src/component/ClientManager';

let server: Server;
const id1 = '1';

describe('server shut down sucessfully', () => {
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
    test('shut down should not reject', async () => {
        expect(server.shutdown()).resolves.toBeUndefined();
    });
});
