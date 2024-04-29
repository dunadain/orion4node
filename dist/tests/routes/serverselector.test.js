"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const ServerSelector_1 = require("../../src/router/ServerSelector");
(0, globals_1.describe)('server selector', () => {
    (0, globals_1.it)('should throw an error when there is no route', () => {
        ServerSelector_1.serverSelector.addRoute('game', async () => {
            return '33';
        });
        (0, globals_1.expect)(ServerSelector_1.serverSelector.selectServer('1', 'connector')).rejects.toThrowError('route not found for serverType:connector');
        (0, globals_1.expect)(ServerSelector_1.serverSelector.hasRoute('game')).toBe(true);
        (0, globals_1.expect)(ServerSelector_1.serverSelector.selectServer('1', 'game')).resolves.toBe('33');
    });
});
