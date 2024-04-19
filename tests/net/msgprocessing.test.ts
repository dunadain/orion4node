import { beforeAll } from '@jest/globals';
import { Server } from '../../src/server/Server';
import { UWebSocketTransport } from '../../src/transport/uws/UWebSocketTransport';
import { ClientManager } from '../../src/component/ClientManager';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Router } from '../../src/router/Router';
import { RouteSubscriber } from '../../src/router/RouteSubscriber';
import { PushSubscriber } from '../../src/router/PushSubscriber';
import { FileLoader } from '../../src/router/FileLoader';

let server: Server;
let server2: Server;
beforeAll(async () => {
    server = new Server('', 9002, 'connector', '1');
    server.addComponent(UWebSocketTransport);
    server.addComponent(ClientManager);
    server.addComponent(NatsComponent);
    server.addComponent(Router);
    server.addComponent(PushSubscriber);

    server2 = new Server('', 9003, 'game', '2');
    server2.addComponent(NatsComponent);
    server2.addComponent(RouteSubscriber);
    server2.addComponent(FileLoader);
    try {
        await server.start();
        await server2.start();
    } catch (reason) {
        console.error(reason);
    }
});
