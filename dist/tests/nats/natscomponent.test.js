"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const NatsComponent_1 = require("../../src/nats/NatsComponent");
(0, globals_1.describe)('nats component', () => {
    (0, globals_1.it)('should be able to connect to nats', async () => {
        const nats = new NatsComponent_1.NatsComponent({});
        Object.getPrototypeOf(nats).getConnectionOption = () => Promise.resolve({ servers: ['nats://localhost:4000'] });
        await (0, globals_1.expect)(nats.init()).rejects.toThrowError('CONNECTION_REFUSED');
    });
});
