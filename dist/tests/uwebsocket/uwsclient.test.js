"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const UWebSocketClient_1 = require("../../src/transport/uws/UWebSocketClient");
const PacketProcessor_1 = require("../../src/transport/protocol/PacketProcessor");
(0, globals_1.describe)('test uwsclient methods', () => {
    let client;
    (0, globals_1.it)('should throw an error if the message is invalid', () => {
        const buf = Buffer.from('hello');
        client = new UWebSocketClient_1.UWebSocketClient({});
        (0, globals_1.expect)(() => {
            client.onMessage(buf.buffer);
        }).toThrowError('invalid data');
    });
    (0, globals_1.it)('should throw an error if the type is invalid', () => {
        (0, globals_1.expect)(() => {
            client.onMessage((0, PacketProcessor_1.encode)(PacketProcessor_1.PackType.ERROR));
        }).toThrowError(`invalid package type: ${PacketProcessor_1.PackType.ERROR.toString()}`);
    });
});
