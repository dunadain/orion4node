import { describe, expect, it } from '@jest/globals';
import { NatsComponent } from '../../src/nats/NatsComponent.mjs';
import { Server } from '../../src/server/Server.mjs';

describe('nats component', () => {
    it('should be able to connect to nats', async () => {
        const nats = new NatsComponent({} as Server);
        process.env.NATS_URL = 'nats://localhost:4000';
        await expect(nats.init()).rejects.toThrowError('CONNECTION_REFUSED');
    });
});
