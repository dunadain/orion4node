import { describe, expect, it } from '@jest/globals';
import { serverSelector } from '../../src/router/ServerSelector';

describe('server selector', () => {
    it('should throw an error when there is no route', () => {
        serverSelector.addRoute('game', async () => {
            return '33';
        });
        expect(serverSelector.selectServer('1', 'connector')).rejects.toThrowError(
            'route not found for serverType:connector'
        );
        expect(serverSelector.hasRoute('game')).toBe(true);
        expect(serverSelector.selectServer('1', 'game')).resolves.toBe('33');
    });
});
