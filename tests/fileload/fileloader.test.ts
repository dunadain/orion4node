import { describe, expect, it, test } from '@jest/globals';
import { FileLoader } from '../../src/router/FileLoader';
import { Server } from '../../src/server/Server';
import * as path from 'node:path';
import { handle } from '../../src/router/RouterUtils';
import { Proto } from '../utils/Proto';

describe('load handlers', () => {
    it('should not throw err', async () => {
        const fileLoader = new FileLoader({} as Server);
        await expect(fileLoader.init()).resolves.toBeUndefined();
    });

    test('import loaded module', async () => {
        await expect(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
        const m = await import(path.join(__dirname, 'handler', 'TestHandler'));
        expect(m.TestHandler.prototype.handle).not.toBeUndefined();
    });

    it('should have handlers in RouteUtils', async () => {
        await expect(handle({ id: 1, protoId: Proto.GameLogin }, undefined, {} as Server)).resolves.toBe(1000);
    });
});
