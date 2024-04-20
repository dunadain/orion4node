import { describe, expect, it, test } from '@jest/globals';
import { FileLoader } from '../../src/router/FileLoader';
import { Server } from '../../src/server/Server';
import * as path from 'node:path';

describe('load handlers', () => {
    it('should not throw err', async () => {
        const fileLoader = new FileLoader({} as Server);
        await expect(fileLoader.init()).resolves.toBeUndefined();
    });

    test('import loaded module', async () => {
        await expect(import(path.join(__dirname, 'handler', 'TestHandler'))).resolves.not.toBeUndefined();
    });
});
