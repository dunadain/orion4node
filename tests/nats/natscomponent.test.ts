import { describe, expect, it } from '@jest/globals';
import { NatsComponent } from '../../src/nats/NatsComponent';
import { Server } from '../../src/server/Server';

describe('nats component', () => {
    it('should be able to connect to nats', async () => {
        const nats = new NatsComponent({} as Server);
        Object.getPrototypeOf(nats).getConnectionOption = () => Promise.resolve({ servers: ['nats://localhost:4000'] });
        await expect(nats.init()).rejects.toThrowError('CONNECTION_REFUSED');
    });
});
